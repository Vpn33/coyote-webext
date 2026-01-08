import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用于存储波形编辑数据
    editWaveItem: null
  },
  mutations: {
    // 设置编辑波形数据
    setEditWaveItem(state, item) {
      state.editWaveItem = item
      console.log('Vuex存储波形数据:', item)
    },
    // 清除编辑波形数据
    clearEditWaveItem(state) {
      state.editWaveItem = null
      console.log('Vuex清除波形数据')
    }
  },
  actions: {
    // 设置编辑波形数据的action
    setEditWaveItem({ commit }, item) {
      commit('setEditWaveItem', item)
    },
    // 清除编辑波形数据的action
    clearEditWaveItem({ commit }) {
      commit('clearEditWaveItem')
    }
  },
  getters: {
    // 获取编辑波形数据的getter
    getEditWaveItem: state => state.editWaveItem
  }
})