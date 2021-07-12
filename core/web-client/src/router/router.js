import Vue from "vue";
import store from "../store";
import Router from "vue-router";

import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Search from "@/views/Search.vue";

import entities from "./entities";
import create from "./create";
import dashboard from "./dashboard";
import user from "./user";

Vue.use(Router);

const requireAuth = (to, from, next) => {
  if (store.state.user.isLoggedIn) {
    if (!store.state.user.id) {
      store
        .dispatch("verify")
        .then((user) => (user ? next() : next("/login")))
        .catch(() => {
          next("/login");
        });
    } else {
      next();
    }
    return;
  }
  next("/login");
};

const router = new Router({
  routes: [
    {
      path: "/",
      name: "home",
      beforeEnter: requireAuth,
      component: Home,
      redirect: {
        name: "search",
      },
      children: [
        {
          path: "search",
          name: "search",
          component: Search,
        },
        create,
        ...entities,
        dashboard,
        user,
      ],
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
  ],
});

router.beforeResolve((to, from, next) => {
  if (to.name) {
    store.dispatch("routeIsLoading");
  }
  next();
});

router.afterEach(() => {
  setTimeout(() => {
    store.dispatch("routeIsDone");
  }, 1200);
});
export default router;
