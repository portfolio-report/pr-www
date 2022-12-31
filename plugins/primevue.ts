import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Checkbox from 'primevue/checkbox'
import Chip from 'primevue/chip'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import Message from 'primevue/message'
import OverlayPanel from 'primevue/overlaypanel'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Skeleton from 'primevue/skeleton'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import TreeTable from 'primevue/treetable'
import Toast from 'primevue/toast'

import Ripple from 'primevue/ripple'
import Styleclass from 'primevue/styleclass'
import Tooltip from 'primevue/tooltip'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ConfirmationService)
  nuxtApp.vueApp.use(ToastService)

  nuxtApp.vueApp.component('Badge', Badge)
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Calendar', Calendar)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('Chart', Chart)
  nuxtApp.vueApp.component('Checkbox', Checkbox)
  nuxtApp.vueApp.component('Chip', Chip)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('ConfirmDialog', ConfirmDialog)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Dialog', Dialog)
  nuxtApp.vueApp.component('Dropdown', Dropdown)
  nuxtApp.vueApp.component('InputNumber', InputNumber)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Menu', Menu)
  nuxtApp.vueApp.component('Message', Message)
  nuxtApp.vueApp.component('OverlayPanel', OverlayPanel)
  nuxtApp.vueApp.component('ProgressBar', ProgressBar)
  nuxtApp.vueApp.component('ProgressSpinner', ProgressSpinner)
  nuxtApp.vueApp.component('Skeleton', Skeleton)
  nuxtApp.vueApp.component('TabPanel', TabPanel)
  nuxtApp.vueApp.component('TabView', TabView)
  nuxtApp.vueApp.component('Tag', Tag)
  nuxtApp.vueApp.component('Textarea', Textarea)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.component('TreeTable', TreeTable)

  nuxtApp.vueApp.directive('ripple', Ripple)
  nuxtApp.vueApp.directive('styleclass', Styleclass)
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
