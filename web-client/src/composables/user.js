import { ref } from "@vue/composition-api";
import api from "@/api/index";
import kc from "@/api/keycloak";
import { useEvents } from "@/composables/events";

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
let isListeningEvents = false;

const loginUser = async ({ id, email, username, token }) => {
  localStorage.setItem("jwt", token);
  api.setAuthorization(token);
  await api.users.update(id, { email, username });
  const { data: loggedInUser } = await api.users.getById(id);
  api.socket.connect();
  return loggedInUser;
};

export const useUser = () => {
  const loggedIn = ref(false);
  user = ref(user);
  recentlyViewed = ref(recentlyViewed);
  const error = ref(null);
  const loading = ref(false);

  if (!isListeningEvents) {
    useEvents(user.value.id, user.value.id, {
      onUpdate: () => load(),
    });
    isListeningEvents = true;
  }

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
    try {
      user.value = await loginUser(data);
    } catch (e) {
      if (e?.response?.data?.code === 409) {
        const {
          data: { collection },
        } = await api.users.get({
          email: user.email,
        });
        const conflictingUser = collection[0];
        await api.users.delete(conflictingUser.id);
        user.value = await loginUser(data);
      }
      error.value = e;
    } finally {
      loading.value = false;
    }
  };
  const addRecentlyViewed = (entity) => {
    const alreadyViewedIds = recentlyViewed.value.map(({ id }) => id);
    if (!alreadyViewedIds.includes(entity.id)) {
      recentlyViewed.value.unshift(entity);
      recentlyViewed.value.splice(10);
    }
  };
  const logout = () => {
    error.value = null;
    loading.value = null;
    return kc
      .logout({
        redirectUri: `${window.location.origin}`,
      })
      .then(() => {
        localStorage.setItem("jwt", "");
        api.socket.close();
        api.setAuthorization();
        loggedIn.value = false;
        user.value = null;
      })
      .catch((e) => (error.value = e))
      .finally(() => (loading.value = false));
  };
  return {
    recentlyViewed,
    user,
    load,
    logout,
    login,
    loggedIn,
    loading,
    error,
    addRecentlyViewed,
  };
};
