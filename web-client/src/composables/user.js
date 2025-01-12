import { computed, ref } from "@vue/composition-api";
import api from "@/api/index";
import kc from "@/api/keycloak";

let user = {
  email: "",
  username: "",
  entityIcon: "",
  entityImages: [],
  created: "",
  modified: "",
  entityType: "user",
  creatorId: "",
  id: "",
  isLoggedIn: !!localStorage.getItem("jwt"),
  recentlyViewed: [],
};

let recentlyViewed = [];

const loginUser = async ({ id, username, email, token, roles, groups }) => {
  localStorage.setItem("jwt", token);
  api.setAuthorization(token);
  await api.users.update(id, { email, username, roles, groups });
  api.socket.connect();
  return api.users.getByIdIfExists(id).then((response) => response?.data ?? {});
};

export const useUser = () => {
  user = ref(user);
  recentlyViewed = ref(recentlyViewed);
  const error = ref(null);
  const loading = ref(false);

  const isAdmin = computed(() => (user.value.roles ?? []).includes("admin"));

  const load = (query = {}) => {
    loading.value = true;
    return api.users
      .getById(user.value.id, query)
      .then(
        ({ data: response }) => (user.value = { ...user.value, ...response })
      )
      .catch((e) => (error.value = e))
      .finally(() => (loading.value = false));
  };
  const login = async (data) => {
    error.value = null;
    loading.value = true;
    return loginUser(data)
      .then((loggedInUser) => {
        user.value = {
          ...user.value,
          ...loggedInUser,
          ...data,
          username: loggedInUser.username,
          roles: data.roles,
          isLoggedIn: true,
        };
      })
      .catch((e) => (error.value = e))
      .finally(() => (loading.value = false));
  };
  const addRecentlyViewed = (entity) => {
    if (entity) {
      const alreadyViewedIds = recentlyViewed.value.map(({ id }) => id);
      if (!alreadyViewedIds.includes(entity.id)) {
        recentlyViewed.value.unshift(entity);
        recentlyViewed.value.splice(10);
      }
    }
  };
  const logout = () => {
    error.value = null;
    loading.value = true;
    localStorage.setItem("jwt", "");
    api.socket.close();
    api.setAuthorization();
    user.value = null;
    return kc
      .logout({
        redirectUri: `${window.location.origin}`,
      })
      .catch((e) => (error.value = e))
      .finally(() => (loading.value = false));
  };
  return {
    recentlyViewed,
    user,
    isAdmin,
    loading,
    error,
    load,
    logout,
    login,
    addRecentlyViewed,
  };
};
