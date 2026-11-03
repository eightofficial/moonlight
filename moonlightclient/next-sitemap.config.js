/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.moonlightmachinery.com',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*', '/api/*'],

  additionalPaths: async (config) => {
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

    // 2. Fetch Blogs
    try {
      const response = await fetch('https://www.moonlightmachinery.com/api/home/blog/get')
      const data = await response.json()

      // Agar aapka blog data kisi aur array key mein hai (jaise data.blogs), toh use yahan update kar sakte hain
      const blogs = data.item || data.blogs || []

      blogs.forEach((blog) => {
        if (blog.slug) {
          result.push({
            loc: `/blog/${blog.slug}`, // Agar aapka route /blogs/ hai, toh ise badal kar /blogs/${blog.slug} kar dein
            changefreq: 'daily',
            priority: 0.8,
            lastmod: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString(),
          })
        }
      })
    } catch (error) {
      console.error('Error fetching blogs for sitemap:', error)
    }

    return result
  },
}