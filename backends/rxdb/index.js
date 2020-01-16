// @flow
const RxDB = require('rxdb');
const { recordSchema, itemSchema, itemKindSchema } = require('../../src/types');
RxDB.plugin(require('pouchdb-adapter-leveldb'));
// RxDB.plugin(require('pouchdb-adapter-memory'));
const leveldown = require('leveldown');

process.chdir(__dirname + '/.data');

RxDB.plugin(require('rxdb/plugins/server'));

RxDB.create({
    name: __dirname + '/.data/mydatabase',
    name: 'heroesdb',
    adapter: 'leveldb',
    // adapter: 'memory',
}).then(async db => {
    await db.collection({ name: 'items', schema: itemSchema });
    await db.collection({ name: 'kinds', schema: itemKindSchema });
    await db.collection({ name: 'records', schema: recordSchema });

    const { app, server } = db.server({
        path: '/',
        port: 9102,
        cors: true,
        startServer: true,
    });
    console.log('serving');
});

// or use a specific folder to store the data
// const database = RxDB.create({
//     name: '/root/user/project/mydatabase',
//     adapter: leveldown, // the full leveldown-module
// });
