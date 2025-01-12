import Vue from "vue";
import App from "./App.vue";
import router from "./router/router";
import store from "./store";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import VueEllipseProgress from "vue-ellipse-progress";
import vuetify from "./plugins/vuetify";
import api from "@/api/index";
import L from "leaflet";
import VueCompositionAPI from "@vue/composition-api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

Vue.use(VueEllipseProgress);
Vue.use(VueCompositionAPI);

Vue.config.productionTip = false;
Vue.prototype.$api = api;

new Vue({
  created() {},
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
