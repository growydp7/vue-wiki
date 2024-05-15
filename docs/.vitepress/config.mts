import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Vue', link: '/vue/' }
    ],

    sidebar: {
      '/vue/': [
        {
          text: '介绍',
          items: [
            { text: '介绍', link: '/vue/' },
          ]
        },
        {
          text: '基础',
          items: [
            { text: 'createApp', link: '/vue/basis/createApp' }
          ]
        }
      ]
    }
  }
})
