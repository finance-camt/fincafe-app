const { getStore } = require('@netlify/blobs');

exports.handler = async function () {
  try {
    const metaStore = getStore('fincafe-meta');
    const filesStore = getStore('fincafe-sessionfiles');

    const { blobs } = await metaStore.list({ prefix: 'meta:' });
    const sessions = [];

    for (const b of blobs) {
      const number = parseInt(b.key.replace('meta:', ''), 10);
      const metaRaw = await metaStore.get(b.key, { type: 'json' });
      const filesRaw = (await filesStore.get('sessionfiles:' + number, { type: 'json' })) || [];

      const slides = filesRaw
        .filter((f) => !f.isPhoto)
        .map((f) => ({ id: f.id, name: f.name, type: f.type, sizeBytes: f.sizeBytes }));
      const photos = filesRaw
        .filter((f) => f.isPhoto)
        .map((f) => ({ id: f.id, name: f.name, sizeBytes: f.sizeBytes }));

      sessions.push({
        id: String(number),
        number,
        title: (metaRaw && metaRaw.title) || 'ครั้งที่ ' + number,
        date: (metaRaw && metaRaw.date) || '',
        slides,
        photos,
        pdca: (metaRaw && metaRaw.pdca) || { P: [], D: [], C: [], A: [] }
      });
    }

    sessions.sort((a, b) => b.number - a.number);
    return { statusCode: 200, body: JSON.stringify(sessions) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
