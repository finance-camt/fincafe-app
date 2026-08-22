const { makeStore } = require('../lib/blobs-helper.js');

exports.handler = async function (event) {
  try {
    const { number } = JSON.parse(event.body || '{}');
    const metaStore = makeStore('fincafe-meta');
    const filesStore = makeStore('fincafe-sessionfiles');
    const fileMetaStore = makeStore('fincafe-filemeta');
    const fileDataStore = makeStore('fincafe-filedata');

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
