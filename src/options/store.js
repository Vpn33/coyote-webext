import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用于存储漫画脚本编辑数据
    editMangaScript: null
  },
  mutations: {
    // 设置编辑漫画脚本数据
    setEditMangaScript(state, item) {
      state.editMangaScript = item
      console.log('Vuex存储漫画脚本数据:', item)
    },
    // 清除编辑漫画脚本数据
    clearEditMangaScript(state) {
      state.editMangaScript = null
      console.log('Vuex清除漫画脚本数据')
    }
  },
  actions: {
    // 设置编辑漫画脚本数据的action 
    setEditMangaScript({ commit }, item) {
      commit('setEditMangaScript', item)
    },
    // 清除编辑漫画脚本数据的action
    clearEditMangaScript({ commit }) {
      commit('clearEditMangaScript')
    }
  },
  getters: {
    // 获取编辑漫画脚本数据的getter
    getEditMangaScript: state => state.editMangaScript
  }
})