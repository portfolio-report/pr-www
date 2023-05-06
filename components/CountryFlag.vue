<script setup lang="ts">
const props = defineProps<{
  country: string
}>()

const icon = computed(() => {
  const mapIcons: Record<string, string> = {
    AR: 'i-flagpack-ar',
    AT: 'i-flagpack-at',
    AU: 'i-flagpack-au',
    BE: 'i-flagpack-be',
    BR: 'i-flagpack-br',
    CA: 'i-flagpack-ca',
    CH: 'i-flagpack-ch',
    CN: 'i-flagpack-cn',
    DE: 'i-flagpack-de',
    DK: 'i-flagpack-dk',
    ES: 'i-flagpack-es',
    FI: 'i-flagpack-fi',
    FR: 'i-flagpack-fr',
    GB: 'i-flagpack-gb-ukm',
    GR: 'i-flagpack-gr',
    IR: 'i-flagpack-ie',
    IN: 'i-flagpack-in',
    IT: 'i-flagpack-it',
    JP: 'i-flagpack-jp',
    KR: 'i-flagpack-kr',
    LI: 'i-flagpack-li',
    LU: 'i-flagpack-lu',
    NL: 'i-flagpack-nl',
    NO: 'i-flagpack-no',
    NZ: 'i-flagpack-nz',
    PL: 'i-flagpack-pl',
    PT: 'i-flagpack-pt',
    RU: 'i-flagpack-ru',
    SE: 'i-flagpack-se',
    SG: 'i-flagpack-sg',
    TR: 'i-flagpack-tr',
    TW: 'i-flagpack-tw',
    US: 'i-flagpack-us',
    VN: 'i-flagpack-vn',
    ZA: 'i-flagpack-za',
  }
  return mapIcons[props.country]
})
</script>

<template>
  <i class="ii" :class="icon" />
</template>
