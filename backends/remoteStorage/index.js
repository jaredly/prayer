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

const fs = require('fs');

const dump = res => {
    const archiver = require('archiver');
    var archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level.
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(res);

    archive.directory('path/to/storage', false);
    // archive.on('end', () => {
    //   res.end()
    // });
    archive.finalize();
};

// const http = require('http')

// //create a server object:
// http.createServer(function (req, res) {
//   dump(res)
// }).listen(process.env.PORT);
