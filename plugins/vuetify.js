import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: '#006e90', // colors.blue.darken2
    accent: colors.grey.darken3,
    secondary: '#f18f01', // colors.amber.darken3
    info: '#006e90', // colors.teal.lighten1
    warning: '#f18f01', // colors.amber.base
    error: colors.deepOrange.accent4,
    success: '#99C24D' // colors.green.accent3
  }
})
