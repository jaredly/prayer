// @flow

import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import Yjs from 'yjs';
import setupBackend from './backend';
import RxDB from 'rxdb';

import LoadingStateWrapper, {
    useLoadingState,
} from '../../LoadingStateWrapper';
import { loaded } from '../../loadingState';
// import LoginScreen from './Login';
import Shell from '../../screens/Shell';
import { createApi, type PrayerJournalApi } from '../../db/prayerJournalApi';
import { type Collection } from '../../db/apiInterface';
// import prayerJournalModule, {
//     type PrayerJournalModuleType,
// } from './prayerJournalModule';

import { wrapLoadingState } from '../../LoadingStateWrapper';
import { type LoadingState } from '../../loadingState';

const ponce = v =>
    new Promise((res, rej) =>
        v.once(ack => (!ack || ack.err ? rej(ack) : res(ack))),
    );

export const login = async (
    gun: *,
    user: *,
    username: string,
    password: string,
) => {
    console.log('logging in');
    const exists = await ponce(gun.get(`~@${username}`)).catch(err => false);
    if (!exists) {
        console.log('creating');
        await new Promise((res, rej) =>
            user.create(username, password, ack =>
                ack.err ? rej(new Error(ack.err)) : res(ack),
            ),
        );
        console.log('created');
    }
    await new Promise((res, rej) =>
        user.auth(username, password, ack =>
            ack.err ? rej(new Error(ack.err)) : res(ack),
        ),
    );
    user.recall({ sessionStorage: true });
    console.log('logged in');
    return;
};

const App = () => {
    // const [api, setApi] = React.useState(null);
    const api = React.useMemo(() => {
        RxDB.plugin(require('pouchdb-adapter-idb'));
        const db = RxDB.create({
            name: 'heroesdb',
            adapter: 'idb',
            password: 'myLongAndStupidPassword', // optional
            multiInstance: true, // default: true
        });
        return createApi(setupBackend(db));
    });
    if (!api) {
        return 'Lodaing';
    }
    return <Shell api={api} />;
};

ReactDOM.render(<App />, document.getElementById('root'));
