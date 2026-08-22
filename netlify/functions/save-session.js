const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const { number, title, date, pdca } = JSON.parse(event.body || '{}');
    if (number === undefined || number === null) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing number' }) };
    }
    const metaStore = getStore('fincafe-meta');
    await metaStore.set('meta:' + number, JSON.stringify({ title, date, pdca }));
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
