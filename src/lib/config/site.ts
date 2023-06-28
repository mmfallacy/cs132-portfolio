import type { SiteConfig } from '$lib/types/site'

export const site: SiteConfig = {
  protocol: import.meta.env.URARA_SITE_PROTOCOL ?? import.meta.env.DEV ? 'http://' : 'https://',
  domain: import.meta.env.URARA_SITE_DOMAIN ?? 'urara-demo.netlify.app',
  title: 'Cakes',
  subtitle: 'A Data Science portfolio',
  lang: 'en-US',
  description: 'Powered by SvelteKit/Urara',
  author: {
    avatar: '/assets/nc@512.png',
    name: 'Cakes',
    status: '🍰',
    bio: 'S Canlas • Chael Monasterial • Jed Tan'
  },
  themeColor: '#3D4451'
}
