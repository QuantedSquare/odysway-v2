export default defineEventHandler(async (event) => {
  // Get all content for sitemap
  const [pages, blogPosts] = await Promise.all([
    queryCollection(event, 'content').where({ _path: { $ne: '/blog' } }).all(),
    queryCollection(event, 'blog').where({ published: true }).all()
  ])

  // Filter out blog URLs that have /blog/ prefix and create correct URLs
  const sitemapUrls = [
    // Add regular pages (excluding blog pages with /blog/ prefix)
    ...pages
      .filter((page: any) => !page._path?.startsWith('/blog/'))
      .map((page: any) => ({
        url: page._path,
        lastmod: page.updatedAt || page.publishedAt,
        changefreq: 'monthly',
        priority: 0.8
      })),
    
    // Add blog posts with correct URLs (without /blog/ prefix)
    ...blogPosts.map((post: any) => ({
      url: `/${post.slug}`,
      lastmod: post.publishedAt,
      changefreq: 'monthly',
      priority: 0.7
    }))
  ]

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(item => `  <url>
    <loc>https://odysway.com${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
