export default defineNitroConfig({
  vercel: {
    config: {
      bypassToken: process.env.BYPASS_TOKEN,
    },
  },
})
