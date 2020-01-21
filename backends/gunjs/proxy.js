// server.js

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9104 });

const url = 'http://localhost:9103/gunz';

wss.on('connection', ws => {
    const connection = new WebSocket(url);
    let pending = [];

    const stats = { toServer: 0, fromServer: 0 };

    connection.onopen = () => {
        if (pending) {
            pending.forEach(m => connection.send(m));
            pending = null;
        }
        // connection.send('Message From Client');
    };

    connection.onerror = error => {
        console.log(error);
        // console.log(`WebSocket error: ${JSON.stringify(error)}`);
    };

    connection.onmessage = e => {
        stats.fromServer += e.data.length;
        console.log('from server', e.data.length, stats);
        // console.log(e.data);
        try {
            ws.send(e.data);
        } catch (e) {
            console.log('failed sending message');
            console.error(e);
        }
    };

    ws.on('close', () => {
        connection.close();
    });

    ws.on('message', message => {
        stats.toServer += message.length;
        console.log('from client', message.length, stats);
        if (pending) {
            pending.push(message);
        } else {
            connection.send(message);
        }
        // console.log(`Received message => ${message}`);
    });
    // ws.send('Hello! Message From Server!!');
});

// // client.js

// const WebSocket = require('ws')
// const url = 'ws://localhost:8080'
