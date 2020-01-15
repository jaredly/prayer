// @flow
const Y = require('yjs');
// window.Y = Y;
// window.yArray = require('y-array');
// require('y-array')(Y); // add the y-array type to Yjs
// require('y-websockets-client')(Y);
// require('y-indexeddb')(Y);
// require('y-array')(Y);
// require('y-map')(Y);
// require('y-text')(Y);

export default () => {
    const y = new Y.Y({
        db: {
            // name: 'memory', // use memory database adapter.
            name: 'indexeddb', // use indexeddb database adapter instead for offline apps
        },
        connector: {
            // name: 'webrtc', // use webrtc connector
            name: 'websockets-client',
            // name: 'xmpp'
            room: 'my-room', // clients connecting to the same room share data
        },
        // sourceDir: '/bower_components', // location of the y-* modules (browser only)
        share: {
            items: 'y-map',
            records: 'y-map',
            kinds: 'y-map',
        },
    });
    window.y = y;
    // The Yjs instance `y` is available
    // y.share.* contains the shared types

    // Bind `y.share.textarea` to `<textarea/>`
    // y.share.textarea.bind(document.querySelector('textarea'));
    return {
        getCollection: (col: string) => {
            const collection = y.share[col];
            throw new Error('fail');
        },
        isConnected: () => true,
        getUsername: () => 'y.db.userId',
        logout: () => {},
    };
};
