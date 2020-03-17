<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class IndexPage extends Vue {
  fetch({ redirect }: Context) {
    redirect(303, '/search')
  }
}
</script>
