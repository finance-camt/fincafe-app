const { makeStore } = require('../lib/blobs-helper.js');
const crypto = require('crypto');

exports.handler = async function (event) {
  try {
    const { number, isPhoto, fileName, mimeType, type, base64, link } = JSON.parse(event.body || '{}');
    const filesStore = makeStore('fincafe-sessionfiles');
    const id = crypto.randomUUID();
    const listKey = 'sessionfiles:' + number;

    if (link) {
      // Link-only entry: no file bytes stored at all, just a reference to an externally-hosted file.
      const existing = (await filesStore.get(listKey, { type: 'json' })) || [];
      existing.push({ id, name: fileName, type, sizeBytes: 0, isPhoto: !!isPhoto, link });
      await filesStore.set(listKey, JSON.stringify(existing));
      return { statusCode: 200, body: JSON.stringify({ id, name: fileName }) };
    }

    if (!base64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing file data' }) };
    }
    const fileDataStore = makeStore('fincafe-filedata');
    const fileMetaStore = makeStore('fincafe-filemeta');

    const buffer = Buffer.from(base64, 'base64');
    await fileDataStore.set('filedata:' + id, buffer);

    const sizeBytes = buffer.length;
    await fileMetaStore.set(
      'filemeta:' + id,
      JSON.stringify({ name: fileName, mimeType, type, sizeBytes })
    );

    const existing = (await filesStore.get(listKey, { type: 'json' })) || [];
    existing.push({ id, name: fileName, type, sizeBytes, isPhoto: !!isPhoto });
    await filesStore.set(listKey, JSON.stringify(existing));

    return { statusCode: 200, body: JSON.stringify({ id, name: fileName }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
