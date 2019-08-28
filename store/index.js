export const actions = {
  /**
   * nuxtServerInit is running on the server in before a page is rendered on the server
   */
  nuxtServerInit({ commit }, { req }) {
    // If express-session has found as session, load data into store
    if (req.session && req.session.user) {
      commit('auth/setUser', req.session.user)
    }
  },
}
