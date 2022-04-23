import path from 'path'
import { execSync } from 'child_process'
import { getPackages } from '@lerna/project'

/**
 * @description 获取lerna项目中定义的packages
 *
 * @returns {Array}
 */
function getAllPackages() {
  return getPackages()
}

/**
 * @description 获取lerna项目中发生变化的packages名称
 *
 * @param {Array} allPackages 通过@lerna/project获取的一组包信息
 * @returns {Array}
 */
function getChangedPackages(allPackages) {
  const changedFiles = execSync('git diff --cached --name-only').toString().split('\n').map(path.normalize)
  const changedPackages = allPackages.filter((pkg) => {
    const packagePrefix = path.relative('.', pkg.location) + path.sep
    for (let changedFile of changedFiles) {
      if (changedFile.indexOf(packagePrefix) === 0) {
        return true
      }
    }
  })
  return changedPackages.map((pkg) => pkg.name)
}

/**
 * @description 插入自动完成的功能
 * @param {Array} options
 * @returns
 */
function autoCompleteSource(options) {
  return (_, input) => {
    return new Promise((resolve) => {
      const matches = options.filter(({ name }) => !input || name.toLowerCase().indexOf(input.toLowerCase()) === 0)
      resolve(matches)
    })
  }
}

/**
 * @description 生成问题的描述
 * @param {Array} choices commit类型的选项列表
 * @returns
 */
async function generateQuestions(choices, config) {
  const pkgs = await getAllPackages()
  const allPackages = pkgs.map((pkg) => pkg.name)
  const changedPackages = getChangedPackages(pkgs)
  const questions = [
    {
      type: 'autocomplete',
      name: 'type',
      message:
        config.questions && config.questions.type ? config.questions.type : '请输入或选择您正在提交的commit类型:',
      choices,
      loop: false,
    },
    {
      type: 'checkbox',
      name: 'packages',
      default: changedPackages,
      choices: allPackages,
      message: `请选择受影响的packages(${changedPackages.length}个被检测到, 只检测子package中代码是否改变):\n`,
    },
    {
      type: config.scopes ? 'list' : 'input',
      name: 'scope',
      message: config.questions && config.questions.scope ? config.questions.scope : '表示此更改的范围(可选):\n',
      choices: config.scopes && [{ name: '[none]', value: '' }].concat(config.scopes),
      when: !config.skipQuestions.includes('scope'),
    },
    {
      type: 'maxlength-input',
      name: 'subject',
      message:
        config.questions && config.questions.subject ? config.questions.subject : '写一个简短的祈使句来描述(必填):\n',
      maxLength: config.subjectMaxLength,
      validate: function (value) {
        return !!value
      },
    },
    {
      type: 'input',
      name: 'body',
      message:
        config.questions && config.questions.body
          ? config.questions.body
          : '提供更改的详细说明(可选)。使用 "|" 来换行:\n',
      when: !config.skipQuestions.includes('body'),
    },
    {
      type: 'input',
      name: 'breaking',
      message: '列出任何重大更改(可选):\n',
      when: !config.skipQuestions.includes('breaking'),
    },
    {
      type: 'input',
      name: 'footer',
      message:
        config.questions && config.questions.footer
          ? config.questions.footer
          : '列出此次更改关闭的所有issues(可选)。例如#1, #2:',
      when: !config.skipQuestions.includes('footer'),
    },
  ]
  return questions.map((question) => {
    question.type === 'autocomplete' && (question.source = autoCompleteSource(question.choices))
    return question
  })
}

export default generateQuestions
