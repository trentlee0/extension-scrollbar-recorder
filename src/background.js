import {get, set, Key} from '@/util/common'

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.name === 'save-scroll') {
    console.log(req)
    get(Key.ENABLE_AUTO_SAVE).then(autoSave => {
      if (!autoSave) return
      get(Key.URLS).then(urls => {
        if (!urls || !urls[req.data.url]) return
        urls[req.data.url] = {
          title: req.data.title,
          url: req.data.url,
          x: req.data.x,
          y: req.data.y,
        }
        set(Key.URLS, urls)
        console.log('save urls')
      })
    })
  }
})
