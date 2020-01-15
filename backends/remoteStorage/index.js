#!/usr/bin/env node
process.umask(077);

const Armadietto = require('armadietto');
(store = new Armadietto.FileTree({ path: '.data/storage' })),
    (server = new Armadietto({
        store: store,
        http: { port: process.env.PORT || 9101 },
        allow: { signup: true },
    }));

server.boot();
