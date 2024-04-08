<script setup lang="ts">
const props = defineProps<{
  country: string
}>()

const icon = computed(() => {
  const mapIcons: Record<string, string> = {
    AE: 'i-flagpack-ae',
    AR: 'i-flagpack-ar',
    AT: 'i-flagpack-at',
    AU: 'i-flagpack-au',
    BE: 'i-flagpack-be',
    BG: 'i-flagpack-bg',
    BR: 'i-flagpack-br',
    CA: 'i-flagpack-ca',
    CH: 'i-flagpack-ch',
    CN: 'i-flagpack-cn',
    CZ: 'i-flagpack-cz',
    DE: 'i-flagpack-de',
    DK: 'i-flagpack-dk',
    ES: 'i-flagpack-es',
    EU: 'i-flag-eu-4x3',
    FI: 'i-flagpack-fi',
    FR: 'i-flagpack-fr',
    GB: 'i-flagpack-gb-ukm',
    GR: 'i-flagpack-gr',
    HK: 'i-flagpack-hk',
    HR: 'i-flagpack-hr',
    HU: 'i-flagpack-hu',
    ID: 'i-flagpack-id',
    IL: 'i-flagpack-il',
    IR: 'i-flagpack-ie',
    IN: 'i-flagpack-in',
    IS: 'i-flagpack-is',
    IT: 'i-flagpack-it',
    JP: 'i-flagpack-jp',
    KR: 'i-flagpack-kr',
    LI: 'i-flagpack-li',
    LU: 'i-flagpack-lu',
    MX: 'i-flagpack-mx',
    MY: 'i-flagpack-my',
    NL: 'i-flagpack-nl',
    NO: 'i-flagpack-no',
    NZ: 'i-flagpack-nz',
    PH: 'i-flagpack-ph',
    PL: 'i-flagpack-pl',
    PT: 'i-flagpack-pt',
    RO: 'i-flagpack-ro',
    RU: 'i-flagpack-ru',
    SE: 'i-flagpack-se',
    SG: 'i-flagpack-sg',
    TH: 'i-flagpack-th',
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
