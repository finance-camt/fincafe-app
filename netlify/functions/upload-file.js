const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

exports.handler = async function (event) {
  try {
    const { number, isPhoto, fileName, mimeType, type, base64 } = JSON.parse(event.body || '{}');
    if (!base64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing file data' }) };
    }
    const id = crypto.randomUUID();

    const fileDataStore = getStore('fincafe-filedata');
    const fileMetaStore = getStore('fincafe-filemeta');
    const filesStore = getStore('fincafe-sessionfiles');

    const buffer = Buffer.from(base64, 'base64');
    await fileDataStore.set('filedata:' + id, buffer);

    const sizeBytes = buffer.length;
    await fileMetaStore.set(
      'filemeta:' + id,
      JSON.stringify({ name: fileName, mimeType, type, sizeBytes })
    );

    const listKey = 'sessionfiles:' + number;
    const existing = (await filesStore.get(listKey, { type: 'json' })) || [];
    existing.push({ id, name: fileName, type, sizeBytes, isPhoto: !!isPhoto });
    await filesStore.set(listKey, JSON.stringify(existing));

    return { statusCode: 200, body: JSON.stringify({ id, name: fileName }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
