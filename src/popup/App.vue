<template>
  <div>
    <div style="display: flex; justify-content: space-around; align-items: center;">
      <img src="@/assets/record.png" height="55"/>
      <input
          type="text"
          placeholder="搜索"
          style="width: 250px; height: 23px; outline: none;"
          autofocus
          v-model="search"
          @input="handleSearchUrl"
      />
    </div>
    <div id="table">
      <table>
        <tr v-for="item in showUrls" :key="item.url">
          <td>
            <div class="text-ellipsis" style="width: 210px;">
              <a :title="item.title" @click="handleGoUrl(item.url)" :href="item.url">{{ item.title }}</a>
            </div>
          </td>
          <td>
            <div style="width: 60px;">({{ item.x }},{{ item.y }})</div>
          </td>
          <td>
            <div style="width: 50px;">
              <button style="font-size: xx-small; color: #f44336;" @click="handleRemoveUrl(item.url)">删除</button>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="font-size: small; margin-bottom: 10px;">
      <label for="jump-enable-input" style="vertical-align: middle;">自动跳转</label>
      <input
          id="jump-enable-input"
          type="checkbox"
          style="vertical-align: middle;"
          @click="autoJumpInput"
          v-model="enableJump"
      />
      <label for="auto-save-input" style="margin-left: 10px; vertical-align: middle;">自动保存</label>
      <input
          id="auto-save-input"
          type="checkbox"
          style="vertical-align: middle;"
          @click="autoSaveInput"
          v-model="enableAutoSave"
      />
      延迟
      <input
          :disabled="!enableAutoSave"
          type="number"
          min="0"
          max="999"
          v-model="autoSaveDelay"
          @input="autoSaveDelayChange"
          style="outline: none; width: 40px"
      /> 秒
    </div>

    <div>
      <button v-show="isShowJumpBtn" style="background: #90caf9" @click="handleJumpClick">跳转到目标位置</button>
    </div>
    <div>
      <button style="background: #80cbc4" @click="handleRecordClick">记录当前页面位置</button>
    </div>
  </div>
</template>

<script>
import {get, set, Key, handleUrl} from '@/util/common'

export default {
  name: 'App',
  data() {
    return {
      urls: {},
      enableJump: false,
      enableAutoSave: false,
      autoSaveDelay: 0,
      currentUrl: '',
      search: '',
      showUrls: '',
    }
  },
  computed: {
    isShowJumpBtn() {
      return Reflect.has(this.urls, handleUrl(this.currentUrl))
    }
  },
  created() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      this.currentUrl = tabs[0].url
    })
    get(Key.URLS).then(urls => {
      this.urls = urls || {}
    })
    get(Key.ENABLE_JUMP).then(enableJump => {
      this.enableJump = enableJump
    })
    get(Key.ENABLE_AUTO_SAVE).then(enableAutoSave => {
      this.enableAutoSave = enableAutoSave
    })
    get(Key.AUTO_SAVE_DELAY).then(autoSaveDelay => {
      this.autoSaveDelay = autoSaveDelay || 60
    })
  },
  methods: {
    autoJumpInput(e) {
      set(Key.ENABLE_JUMP, e.target.checked)
    },
    autoSaveInput(e) {
      set(Key.ENABLE_AUTO_SAVE, e.target.checked)
    },
    handleJumpClick() {
      this.sendMessage('jumpToConnect').then(res => {
        console.log(res)
      })
    },
    handleRecordClick() {
      this.sendMessage('scrollConnect').then(({msg, tabs}) => {
        const url = msg.url
        this.$set(this.urls, url, {
          title: tabs[0].title,
          url: url,
          x: msg.x,
          y: msg.y,
        })
        set(Key.URLS, this.urls)
      })
    },
    sendMessage(name, message) {
      return new Promise(resolve => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          const connect = chrome.tabs.connect(tabs[0].id || null, {name})
          connect.postMessage(message)
          connect.onMessage.addListener(mess => resolve({msg: mess, tabs}))
        })
      })
    },
    handleGoUrl(url) {
      chrome.tabs.create({url, active: true})
    },
    handleRemoveUrl(url) {
      this.$delete(this.urls, url)
      set(Key.URLS, this.urls)
    },
    handleSearchUrl() {
      const key = this.search.toLowerCase()
      this.showUrls = Object.values(this.urls || {})
          .filter(item => item.title
              .toLowerCase()
              .includes(key))
    },
    autoSaveDelayChange() {
      set(Key.AUTO_SAVE_DELAY, this.autoSaveDelay)
    }
  },
  watch: {
    urls: {
      handler() {
        this.handleSearchUrl()
      },
      deep: true
    }
  }
}
</script>

<style lang="sass">
html
  width: 400px
  height: 400px

body
  text-align: center

button
  margin: 5px
  outline: none

.text-ellipsis
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

#table
  margin: 20px auto
  width: 350px
  max-height: 200px
  overflow-y: scroll
  border: #eeeeee solid 1px
  padding: 2px
</style>
