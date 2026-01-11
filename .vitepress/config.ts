import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "AGE Forge",
  description: "Tools, benchmarks, and ecosystem projects for Apache AGE",

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'AGE Forge' }],
    ['meta', { property: 'og:description', content: 'Tools, benchmarks, and ecosystem projects for Apache AGE' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Projects', link: '/projects/' },
      { text: 'About', link: '/about' }
    ],

    sidebar: {
      '/blog/': [
        {
          text: 'Blog Posts',
          items: [
            { text: 'All Posts', link: '/blog/' },
          ]
        }
      ],
      '/projects/': [
        {
          text: 'Projects',
          items: [
            { text: 'Overview', link: '/projects/' },
            { text: 'AgeORM', link: '/projects/age-orm' },
            { text: 'Benchmarks', link: '/projects/benchmarks' },
            { text: 'Web UI Research', link: '/projects/web-ui' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/age-forge' }
    ],

    footer: {
      message: 'Building the Apache AGE ecosystem',
      copyright: 'Copyright © 2025-present AGE Forge'
    },

    search: {
      provider: 'local'
    }
  }
})
