// @flow
const RxDB = require('rxdb');
RxDB.plugin(require('pouchdb-adapter-leveldb')); // leveldown adapters need the leveldb plugin to work
const leveldown = require('leveldown');

RxDB.plugin(require('rxdb/plugins/server'));

RxDB.create({
    name: __dirname + '/.data/mydatabase',
    adapter: leveldown, // the full leveldown-module
}).then(db => {
    const { app, server } = db.server({
        path: '/db', // (optional)
        port: 9102, // (optional)
        cors: true, // (optional), enable CORS-headers
        startServer: true, // (optional), start express server
    });
});

// or use a specific folder to store the data
// const database = RxDB.create({
//     name: '/root/user/project/mydatabase',
//     adapter: leveldown, // the full leveldown-module
// });
