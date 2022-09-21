/**
 * @param {string} key
 * @return {Promise<unknown>}
 */
export function get(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, res => resolve(res))
  })
}

export function set(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({[key]: value}, () => resolve())
  })
}

/**
 * @param {string} url
 * @return {string}
 */
export function handleUrl(url) {
  let href = url.replace('/#/', '/')
  let i = href.lastIndexOf('#')
  return href.substring(0, i === -1 ? href.length : i)
}

export const Key = {
  URLS: 'urls',
  ENABLE_JUMP: 'enableJump',
  ENABLE_AUTO_SAVE: 'enableAutoSave'
}
