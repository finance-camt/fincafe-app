const { getStore } = require('@netlify/blobs');

const KEY = 'auth-hash';

exports.handler = async function (event) {
  try {
    const { action, hash, oldHash, newHash } = JSON.parse(event.body || '{}');
    const store = getStore('fincafe-auth');

    if (action === 'hasPasscode') {
      const v = await store.get(KEY);
      return { statusCode: 200, body: JSON.stringify({ result: !!v }) };
    }
    if (action === 'setPasscode') {
      await store.set(KEY, hash);
      return { statusCode: 200, body: JSON.stringify({ result: true }) };
    }
    if (action === 'checkPasscode') {
      const v = await store.get(KEY);
      return { statusCode: 200, body: JSON.stringify({ result: v === hash }) };
    }
    if (action === 'changePasscode') {
      const v = await store.get(KEY);
      if (v !== oldHash) {
        return { statusCode: 200, body: JSON.stringify({ result: false }) };
      }
      await store.set(KEY, newHash);
      return { statusCode: 200, body: JSON.stringify({ result: true }) };
    }
    return { statusCode: 400, body: JSON.stringify({ error: 'unknown action' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
