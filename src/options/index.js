import Vue from "vue";
import AppComponent from "./pages/App.vue";
import router from "./router";
import store from "./store";
import _ from "lodash";
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';

// 注册Element UI组件
Vue.use(ElementUI);

// 添加辅助函数：限制数值范围
Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(AppComponent);
  },
  router,
  store,
  methods: {
  }
});