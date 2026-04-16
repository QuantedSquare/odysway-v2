/* Nullify seo.canonicalUrl for all blog posts — let it be auto-generated from route.path */
import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'nu6yntji',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function nullifyBlogsCanonicalUrl() {
  const blogs = await client.fetch(
    `*[_type == "blog" && defined(seo.canonicalUrl)]{ _id, title, "canonicalUrl": seo.canonicalUrl }`
  )

  console.log(`Found ${blogs.length} blogs with a canonicalUrl set\n`)

  if (blogs.length === 0) {
    console.log('Nothing to do.')
    return
  }

  blogs.forEach(b => console.log(`  - ${b.title}: ${b.canonicalUrl}`))
  console.log()

  let updated = 0
  let failed = 0

  for (const blog of blogs) {
    try {
      await client.patch(blog._id).unset(['seo.canonicalUrl']).commit()
      updated++
    } catch (err) {
      console.error(`❌ Failed for "${blog.title}" (${blog._id}): ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Done — ${updated} updated, ${failed} failed`)
}

nullifyBlogsCanonicalUrl().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
