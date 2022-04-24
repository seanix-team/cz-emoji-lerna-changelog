import findUp from 'find-up'
import { readFile } from 'fs/promises'

const loadConfigUpwards = (filename) => {
  return findUp(filename).then(loadConfig)
}

const loadConfig = (filename) => {
  return loadFileContent(filename)
    .then((obj) => obj && obj.config && obj.config['@seanix/cz-emoji'])
    .catch(() => null)
}

const loadFileContent = (filePath) => {
  return readFile(filePath, 'utf8').then(JSON.parse)
}

export { loadConfigUpwards, loadConfig, loadFileContent }
