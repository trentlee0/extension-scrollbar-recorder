import {get, Key, handleUrl} from '@/util/common'

function getScrollData() {
  return {x: window.scrollX, title: document.title, y: window.scrollY, url: handleUrl(window.location.href)}
}

function sendMsgToBackground(name, data) {
  chrome.runtime.sendMessage({name, data})
}

function jumpToTarget(isClickJump, x, y) {
  if (x && y) {
    scrollTo(x, y)
    return
  }

  const curUrl = handleUrl(window.location.href)
  get(Key.URLS).then((res) => {
    res = res.urls || {}
    const urlObj = res[curUrl]
    if (!urlObj) return

    if (isClickJump) {
      scrollTo(urlObj.x, urlObj.y)
    } else {
      get(Key.ENABLE_JUMP).then(res => {
        if (res.enableJump) {
          scrollTo(urlObj.x, urlObj.y)

          setTimeout(() => {
            window.scrollY !== urlObj.y && scrollTo(urlObj.x, urlObj.y)
          }, 600)
        }
      })
    }
  })
}

chrome.runtime.onConnect.addListener(res => {
  if (res.name === 'scrollConnect') {
    res.onMessage.addListener((msg) => {
      res.postMessage(getScrollData())
    })
  } else if (res.name === 'jumpToConnect') {
    res.onMessage.addListener(() => {
      jumpToTarget(true)
    })
  }
})

window.onload = () => jumpToTarget()

window.onbeforeunload = () => sendMsgToBackground('save-scroll', getScrollData())

// setTimeout(() => {
// }, 60 * 1000)
