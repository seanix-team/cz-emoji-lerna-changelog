# @seanix/cz-emoji-lerna-changelog

> A commitizen adapter developed by cz-lerna-changelog and cz-emoji.

**@seanix/cz-emoji-lerna-changelog** allows you to easily use emojis in your commits using [commitizen] in lerna project.

```sh
? Please enter or select the commit type you are submitted: (Use arrow keys or type to search)
❯ feat      ✨  A new feature (note: this may require a new version number to be released).
  fix       🐛  Bug fixes (note: this may require a new version number to be released).
  ui        💄  Update UI and style files.
  style     🎨  Improving structure / format of the code(does not affect code modifications, whitespace, formatting, missing semicolons, etc).
  refactor  ♻️  A code refactoring change.
  perf      ⚡️  Improving performance.
  docs      📝  Writing docs.
  merge     🔀  Merging branches.
  chore     🔧  Other changes that don't modify src or test files.
  prune     🔥  Removing code or files.
  revert    ⏪  Reverting changes.
  release   🔖  Releasing / Version tags.
  test      ✅  Adding tests.
  ci        👷  CI/CD build system.
  init      🎉  Initial commit.
```

## Install

**Globally**

```bash
npm install --global @seanix/cz-emoji-lerna-changelog

# set as default adapter for your projects
echo '{ "path": "@seanix/cz-emoji-lerna-changelog" }' > ~/.czrc
```

**Locally**

```bash
npm install --save-dev @seanix/cz-emoji-lerna-changelog
```

Add this to your `package.json`:

```json
"config": {
  "commitizen": {
    "path": "@seanix/cz-emoji-lerna-changelog"
  }
}
```

## Usage

```sh
$ git cz
```

## Customization

By default `@seanix/cz-emoji-lerna-changelog` comes ready to run out of the box. Uses may vary, so there are a few configuration options to allow fine tuning for project needs.

### How to

Configuring `cz-emoji` can be handled in the users home directory (`~/.czrc`) for changes to impact all projects or on a per project basis (`package.json`). Simply add the config property as shown below to the existing object in either of the locations with your settings for override.

```json
{
  "config": {
    "@seanix/cz-emoji": {}
  }
}
```

### Configuration Options

#### Lang

You can configure the language displayed by inquiar, support "zh-CN" and "en-US".

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "lang": "zh-CN"
    }
  }
}
```

#### Types

An [Inquirer.js] choices array:

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "types": [
        {
          "emoji": "🌟",
          "code": ":star2:",
          "description": "A new feature",
          "name": "feature"
        }
      ]
    }
  }
}
```

#### Scopes

An [Inquirer.js] choices array:

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "scopes": ["home", "accounts", "ci"]
    }
  }
}
```

#### Symbol

A boolean value that allows for an using a unicode value rather than the default of [Gitmoji](https://gitmoji.carloscuesta.me/) markup in a commit message. The default for symbol is false.

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "symbol": true
    }
  }
}
```

#### Skip Questions

An array of questions you want to skip:

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "skipQuestions": ["scope", "issues"]
    }
  }
}
```

You can skip the following questions: `scope`, `body`, `footer`, and `breaking`. The `type` and `subject` questions are mandatory.

#### Customize Questions

An object that contains overrides of the original questions:

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "questions": {
        "body": "This will be displayed instead of original text"
      }
    }
  }
}
```

#### Customize the subject max length

The maximum length you want your subject has

```json
{
  "config": {
    "@seanix/cz-emoji": {
      "subjectMaxLength": 200
    }
  }
}
```

## Examples

- https://github.com/Falieson/TRAM

## Commitlint

Commitlint can be set to work with this package by leveraging the package https://github.com/arvinxx/commitlint-config-gitmoji.

```bash
npm install --save-dev commitlint-config-gitmoji
```

_commitlint.config.js_

```js
module.exports = {
  extends: ['gitmoji'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)(?:\s)(?:\((.*?)\))?\s((?:.*(?=\())|.*)(?:\(#(\d*)\))?/,
      headerCorrespondence: ['type', 'scope', 'subject', 'ticket'],
    },
  },
}
```
## License

MIT © RainyLiao

[commitizen]: https://github.com/commitizen/cz-cli
[inquirer.js]: https://github.com/SBoudrias/Inquirer.js/
