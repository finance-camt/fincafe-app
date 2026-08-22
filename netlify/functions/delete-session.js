const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  try {
    const { number } = JSON.parse(event.body || '{}');
    const metaStore = getStore('fincafe-meta');
    const filesStore = getStore('fincafe-sessionfiles');
    const fileMetaStore = getStore('fincafe-filemeta');
    const fileDataStore = getStore('fincafe-filedata');

    const listKey = 'sessionfiles:' + number;
    const filesRaw = (await filesStore.get(listKey, { type: 'json' })) || [];
    for (const f of filesRaw) {
      await fileMetaStore.delete('filemeta:' + f.id);
      await fileDataStore.delete('filedata:' + f.id);
    }
    await filesStore.delete(listKey);
    await metaStore.delete('meta:' + number);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
