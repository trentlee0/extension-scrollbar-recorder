<template>
  <div>
    <div style="display: flex; justify-content: space-around; align-items: center;">
      <img src="@/assets/record.png" height="55"/>
      <input
          type="text"
          placeholder="搜索"
          style="width: 250px; height: 23px; outline: none;"
          v-model="search"
          @input="handleSearchUrl"
      />
    </div>
    <div id="table">
      <div
          v-for="item in showUrls"
          :key="item.url"
          style="display: flex; justify-content: end; align-items: center;"
      >
        <div style="height: 35px; line-height: 35px;" class="text-ellipsis">
          <a :title="item.title" @click="handleGoUrl(item.url)" :href="item.url">{{ item.title }}</a>
        </div>
        <div>({{ item.x }},{{ item.y }})</div>
        <button class="remove-btn" @click="handleRemoveUrl(item.url)">删</button>
      </div>
    </div>
    <div style="font-size: small;">
      <label for="auto-save-input" style="vertical-align: middle;">自动保存</label>
      <input
          id="auto-save-input"
          type="checkbox"
          style="vertical-align: middle;"
          @click="autoSaveInput"
          v-model="enableAutoSave"
      />
      <label for="jump-enable-input" style="vertical-align: middle;">自动跳转</label>
      <input
          id="jump-enable-input"
          type="checkbox"
          style="vertical-align: middle;"
          @click="autoJumpInput"
          v-model="enableJump"
      />
    </div>
    <div>
      <button v-show="isShowJumpBtn" id="jump-btn" @click="handleJumpClick">跳转到目标位置</button>
    </div>
    <div>
      <button id="add-btn" @click="handleRecordClick">记录当前页面位置</button>
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
      currentUrl: '',
      search: '',
      showUrls: ''
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
    get(Key.URLS).then(({urls}) => {
      this.urls = urls
    })
    get(Key.ENABLE_JUMP).then(res => {
      this.enableJump = res[Key.ENABLE_JUMP]
    })
    get(Key.ENABLE_AUTO_SAVE).then(res => {
      this.enableAutoSave = res[Key.ENABLE_AUTO_SAVE]
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
    }
  },
  watch: {
    urls() {
      this.showUrls = Object.values(this.urls || {})
    }
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}

body {
  text-align: center;
}

button {
  margin: 5px;
  outline: none;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  color: #f44336;
}

#table {
  margin: 20px auto;
  width: 350px;
  max-height: 200px;
  overflow-y: scroll;
  border: #eeeeee solid 1px;
  padding: 2px;
}

#jump-btn {
  background: #90caf9;
}

#add-btn {
  background: #80cbc4;
}
</style>
