/** @type {import('next-sitemap').IConfig} */
const { loadEnvConfig } = require('@next/env')
const { createClient } = require('@supabase/supabase-js')

loadEnvConfig(process.cwd())

module.exports = {
  siteUrl: 'https://www.moonlightmachinery.com',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*', '/api/*'],

  additionalPaths: async () => {
    const result = []

    // 1. Fetch Products
    try {
      const response = await fetch('https://www.moonlightmachinery.com/api/home/product')
      const data = await response.json()
      const products = data.item || []

      products.forEach((product) => {
        if (product.slug) {
          result.push({
            loc: `/home/machines/${product.slug}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
          })
        }
      })
    } catch (error) {
      console.error('Error fetching products for sitemap:', error)
    }

    // 2. Fetch Blogs directly from Supabase so all posts are included at build time
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are required to generate blog sitemap URLs.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: blogs, error } = await supabase
      .from('moonlightblogs')
      .select('slug, created_at')
      .not('slug', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching blogs for sitemap: ${error.message}`)
    }

    blogs.forEach((blog) => {
      if (blog.slug) {
        result.push({
          loc: `/blog/${encodeURIComponent(blog.slug)}`,
          changefreq: 'daily',
          priority: 0.8,
          lastmod: blog.created_at
            ? new Date(blog.created_at).toISOString()
            : new Date().toISOString(),
        })
      }
    })

    return result
  },
}
