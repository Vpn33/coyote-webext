import Vue from 'vue'
import VueRouter from 'vue-router'
import WavePlayer from "./components/wave-player.vue";
import WaveEditor from "./components/wave-editor.vue";
import CtrlItemList from "./components/ctrl-item-list.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'WavePlayer',
    component: WavePlayer,
  },
  {
    path: '/waveEditor',
    name: 'WaveEditor',
    component: WaveEditor
  },
  {
    path: '/ctrlItemList/',
    name: 'CtrlItemList',
    component: CtrlItemList
  }
]

const router = new VueRouter({
  routes,
  // 启用严格模式，确保路径匹配的一致性
  strict: false,
  // 使用hash模式，避免history模式下的服务器配置问题
  mode: 'hash'
})

export default router