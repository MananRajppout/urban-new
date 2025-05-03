module.exports = {
  siteUrl: process.env.SITE_URL || "https://urbanchat.ai",
  generateRobotsTxt: true, // (optional)
  generateIndexSitemap: false,
  additionalPaths: async (config) => {
    const result = []

    // required value only
    result.push({ loc: '/404' })

    return result
  },

};
