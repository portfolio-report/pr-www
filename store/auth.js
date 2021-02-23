/**
 * This store contains the authentication data
 * which are also stored in the session store on the server
 *
 * The store is client side, it cannot be trusted!
 */

export const state = () => ({
  user: null,
})

export const getters = {
  isAuthenticated: (state) => {
    return state.user && state.user.username
  },
  username: (state, getters) => {
    if (getters.isAuthenticated) {
      return state.user.username
    } else {
      return null
    }
  },
}

export const mutations = {
  setUser(state, user) {
    state.user = user
  },
}

export const actions = {
  async login({ commit }, credentials) {
    try {
      const user = await this.$axios.$post('/auth/login', credentials)
      commit('setUser', user)
    } catch (err) {
      if (err.response.status === 401) {
        throw new Error('Invalid credentials')
      }
      throw err
    }
  },
  async logout({ commit }) {
    await this.$axios.$post('/auth/logout')
    commit('setUser', null)
  },
}
