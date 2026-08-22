const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const { id } = JSON.parse(event.body || '{}');
    const fileMetaStore = getStore('fincafe-filemeta');
    const fileDataStore = getStore('fincafe-filedata');

    const metaRaw = await fileMetaStore.get('filemeta:' + id, { type: 'json' });
    if (!metaRaw) {
      return { statusCode: 404, body: JSON.stringify({ error: 'not found' }) };
    }

    const buf = await fileDataStore.get('filedata:' + id, { type: 'arrayBuffer' });
    if (!buf) {
      return { statusCode: 404, body: JSON.stringify({ error: 'file data not found' }) };
    }
    const base64 = Buffer.from(buf).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({ name: metaRaw.name, mimeType: metaRaw.mimeType, base64 })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
