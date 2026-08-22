const { getStore } = require('@netlify/blobs');

/**
 * Netlify's automatic Blobs context detection doesn't always work depending on
 * how the site was deployed. If NETLIFY_SITE_ID and NETLIFY_API_TOKEN are set
 * as site environment variables, we configure the store manually (Netlify's own
 * documented fallback). Otherwise we fall back to automatic detection.
 */
function makeStore(name) {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN;
  if (siteID && token) {
    return getStore({ name, siteID, token });
  }
  return getStore(name);
}

module.exports = { makeStore };
