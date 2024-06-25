import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
  ],
  rules: [
    ['font-mono', { 'font-family': 'Fira Mono, monospace' }],
  ],
})
