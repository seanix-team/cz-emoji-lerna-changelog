import findUp from 'find-up'
import { readFile } from 'fs/promises'

const loadConfigUpwards = (filename) => {
  return findUp(filename).then(loadConfig)
}

const loadConfig = (filename) => {
  return readFile(filename, 'utf8')
    .then(JSON.parse)
    .then((obj) => obj && obj.config && obj.config['cz-emoji'])
    .catch(() => null)
}

export { loadConfigUpwards, loadConfig }
