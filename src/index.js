import path from 'path'
import autocomplete from 'inquirer-autocomplete-prompt'
import maxlengthInput from 'inquirer-maxlength-input-prompt'
import cliTruncate from 'cli-truncate'
import chalk from 'chalk'
import homedir from 'homedir'
import wrapAnsi from 'wrap-ansi'
import pad from 'pad'
import { analyzeCommits } from '@semantic-release/commit-analyzer'
import { loadConfigUpwards, loadConfig } from './utils/load-config'
import generateQuestions from './utils/generate-questions'
import { formatIssues, formatHead } from './utils/format'
import types from './types.json'

/**
 * @description 读取package.json和项目或全局的.czrc里的配置
 *
 * @returns {Promise}
 */
async function getConfig() {
  const defaultConfig = {
    types,
    symbol: true,
    skipQuestions: [''],
    subjectMaxLength: 75,
    conventional: true,
  }

  const config =
    (await loadConfigUpwards('package.json')) ||
    (await loadConfigUpwards('.czrc')) ||
    (await loadConfig(path.join(homedir(), '.czrc')))

  return { ...defaultConfig, ...config }
}

/**
 * @description 获取带emoji表情的选项
 *
 * @param {Object} config
 * @returns
 */
function getEmojiChoices({ types, symbol }) {
  const maxNameLength = types.reduce(
    (maxLength, type) => (type.name.length > maxLength ? type.name.length : maxLength),
    0
  )

  return types.map((choice) => ({
    name: `${pad(choice.name, maxNameLength)}  ${choice.emoji}  ${choice.description}`,
    value: {
      emoji: symbol ? `${choice.emoji}` : choice.code,
      name: choice.name,
    },
    code: choice.code,
  }))
}

/**
 * @description 创建inqirer交互式命令行的问题
 *
 * @param {Object} config 相关配置
 * @returns
 */
async function createQuestions(config) {
  const choices = getEmojiChoices(config)
  const questions = await generateQuestions(choices, config)
  return {
    questions,
    config,
  }
}

function makeAffectsLine(answers) {
  const selectedPackages = answers.packages
  if (selectedPackages && selectedPackages.length) {
    return `affects: ${selectedPackages.join(', ')}`
  }
}

function getCommitTypeMessage(type) {
  if (!type) {
    return '这个commit表明不需要发布版本'
  }
  return {
    patch: '🛠  这个commit表明需要发布一个 patch 版本 (0.0.X)',
    minor: '✨  这个commit表明需要发布一个 minor 版本 (0.X.0)',
    major: '💥  这个commit表明需要发布一个 major 版本 (X.0.0)',
  }[type]
}

/**
 * @description 根据给定的答案格式化 git commit 消息。
 *
 * @param {Object} answers 由 `inquier.js` 提供的答案
 * @param {Object} config 相关配置
 * @return {String} 格式化的 git 提交消息
 */
function format(answers, config) {
  const { columns } = process.stdout
  answers.subject = formatHead(answers, config)
  const head = cliTruncate(answers.subject, columns)
  const affectsLine = makeAffectsLine(answers)
  if (affectsLine) {
    answers.body = `${affectsLine}\n` + answers.body
  }
  answers.body = answers.body.replace(/\|+/g, '\n')
  const body = wrapAnsi(answers.body, columns)
  const breaking =
    answers.breaking && answers.breaking.trim().length
      ? wrapAnsi(`BREAKING CHANGE: ${answers.breaking.trim()}`, columns)
      : ''
  const footer = formatIssues(answers.footer)
  const message = [head, body, breaking, footer].filter(Boolean).join('\n\n').trim()
  return {
    message,
    config,
  }
}

function printMessage(message) {
  console.log('\n\n此次提交的内容为:')
  console.log(chalk.redBright(`\n\n${message}\n`))
}

async function commitAnalyzer(message, config) {
  if (!config.conventional) {
    printMessage(message)
    return message
  }
  const type = await analyzeCommits(
    {},
    {
      commits: [
        {
          hash: '',
          message,
        },
      ],
      logger: console,
    }
  )
  console.log(chalk.bgCyanBright(`\n${getCommitTypeMessage(type)}\n`))
  printMessage(message)
  return message
}

function makePrompter() {
  return function (cz, commit) {
    cz.prompt.registerPrompt('autocomplete', autocomplete)
    cz.prompt.registerPrompt('maxlength-input', maxlengthInput)
    getConfig()
      .then(createQuestions)
      .then(async ({ questions, config }) => {
        return {
          answers: await cz.prompt(questions),
          config,
        }
      })
      .then(({ answers, config }) => format(answers, config))
      .then(({ message, config }) => commitAnalyzer(message, config))
      .then(commit)
  }
}

module.exports = {
  prompter: makePrompter(),
  makePrompter: makePrompter,
}
