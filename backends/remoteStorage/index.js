#!/usr/bin/env node
process.umask(077);

const port = process.env.PORT || 9101;

const Armadietto = require('armadietto');
(store = new Armadietto.FileTree({ path: '.data/storage' })),
    (server = new Armadietto({
        store: store,
        http: { port: port },
        allow: { signup: true },
    }));

server.boot();
console.log(`listening on http://localhost:${port}`);
