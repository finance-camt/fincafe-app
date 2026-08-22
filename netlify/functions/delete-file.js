const { makeStore } = require('../lib/blobs-helper.js');

exports.handler = async function (event) {
  try {
    const { id, number } = JSON.parse(event.body || '{}');
    const fileMetaStore = makeStore('fincafe-filemeta');
    const fileDataStore = makeStore('fincafe-filedata');
    const filesStore = makeStore('fincafe-sessionfiles');

    await fileMetaStore.delete('filemeta:' + id);
    await fileDataStore.delete('filedata:' + id);

    const listKey = 'sessionfiles:' + number;
    const existing = (await filesStore.get(listKey, { type: 'json' })) || [];
    const updated = existing.filter((f) => f.id !== id);
    await filesStore.set(listKey, JSON.stringify(updated));

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
