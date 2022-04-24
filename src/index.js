import path from 'path'
import autocomplete from 'inquirer-autocomplete-prompt'
import maxlengthInput from 'inquirer-maxlength-input-prompt'
import cliTruncate from 'cli-truncate'
import chalk from 'chalk'
import homedir from 'homedir'
import wrapAnsi from 'wrap-ansi'
import pad from 'pad'
import { loadConfigUpwards, loadFileContent, loadConfig } from './utils/load-config'
import generateQuestions from './utils/generate-questions'
import { formatIssues, formatHead } from './utils/format'
/**
 * @description 读取package.json和项目或全局的.czrc里的配置
 *
 * @returns {Promise}
 */
async function getConfig() {
  const defaultConfig = {
    symbol: true,
    skipQuestions: [''],
    subjectMaxLength: 100,
    conventional: true,
    lang: 'en-US',
  }

  const config =
    (await loadConfigUpwards('package.json')) ||
    (await loadConfigUpwards('.czrc')) ||
    (await loadConfig(path.join(homedir(), '.czrc')))

  // 将默认语言与用户传进来的语言合并，然后获取对应的数据
  const lang = config?.lang ? config.lang : defaultConfig.lang;

  const localesPath = path.resolve(__dirname, `./locales/${lang}.json`)
  const locales = await loadFileContent(localesPath)

  const mergeConfig = { ...defaultConfig, ...locales, ...config }
  return mergeConfig
}

/**
 * @description 获取带emoji表情的选项
 *
 * @param {Object} config
 * @returns
 */
function getEmojiChoices({ types, symbol, locales }) {
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

/**
 * @description 根据给定的答案格式化 git commit 消息。
 *
 * @param {Object} answers 由 `inquier.js` 提供的答案
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
  console.log('\n\nThe content submitted:')
  console.log(chalk.redBright(`\n\n${message}\n`))
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
      .then(commit)
  }
}

module.exports = {
  prompter: makePrompter(),
  makePrompter: makePrompter,
}
