/**
 * This Nuxt middleware protects vue pages from being displayed to the user.
 * It does not prevent the page from being delivered to the client!
 */
export default function ({ _req, store, _error, redirect }) {
  // If the user is not authenticated
  if (
    !store.state.auth ||
    !store.state.auth.user ||
    !store.state.auth.user.username
  ) {
    return redirect('/admin/login')
  }
}
