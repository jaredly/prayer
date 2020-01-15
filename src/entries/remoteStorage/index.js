// @flow

import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
// import Gun from 'gun'
// magically adds the `Gun.user` stuff
// import "gun/sea"

import LoadingStateWrapper, {
    useLoadingState,
} from '../../LoadingStateWrapper';
import { loaded } from '../../loadingState';
import LoginScreen from './Login';
import Shell from '../../screens/Shell';
import { createApi, type PrayerJournalApi } from '../../db/prayerJournalApi';
import { type Collection } from '../../db/apiInterface';
import prayerJournalModule, {
    type PrayerJournalModuleType,
} from '../../db/prayerJournalModule';

import { wrapLoadingState } from '../../LoadingStateWrapper';
import { type LoadingState } from '../../loadingState';

const serializeUser = user => {
    return JSON.stringify(user._.sea);
};
const deserializeUser = (user, string) => {
    const data = JSON.parse(string);
    user.auth(data);
};

export type UserState =
    | { type: 'logged-out' }
    | { type: 'logged-in', user: any };

export const initialUserStatus = (
    rs: RemoteStorageT,
): LoadingState<UserState> => {
    if (rs.remote && rs.remote.connected) {
        return loaded({ type: 'logged-in', user: rs.remote });
    }
    return loaded({ type: 'logged-out' });
};

export const useUser = (
    gun: any,
    loginStatus: LoadingState<UserState>,
    setLoginStatus: any,
): ((string, string) => void) => {
    const updateLoginStatus = wrapLoadingState(loginStatus, setLoginStatus);

    const onLogin = React.useCallback((username: string, password: string) => {
        // const user = gun.user();
        // updateLoginStatus(login(gun, user, username, password).then(res => {
        //     window.localStorage.user = serializeUser(user)
        //     return {type: 'logged-in', user: user}
        // }))
    }, []);
    return onLogin;
};

import RemoteStorage from 'remotestoragejs';

export type RemoteStorageT = {
    setApiKeys: ({ googledrive: string, dropbox: string }) => void,
    prayerJournal: PrayerJournalModuleType,
    access: {
        claim: (string, 'r' | 'rw') => void,
    },
    caching: {
        enable: string => void,
    },
    on: (string, any) => void,
    remote: {
        userAddress: string,
        connected: boolean,
    },
    disconnect: () => void,
};

type AppState = {
    api: PrayerJournalApi,
    rs: RemoteStorageT,
    userState: UserState,
};

const config = require('./config.json');

const getInitialState = () => {
    const rs: RemoteStorageT = new RemoteStorage({
        modules: [prayerJournalModule],
        changeEvents: {
            local: true,
            window: true,
            remote: true,
            conflict: true,
        },
    });
    console.log('config', config);
    rs.setApiKeys({
        googledrive: config['google-client-id'],
        dropbox: config['dropbox-app-key'],
    });
    window.rs = rs;
    rs.access.claim('prayerJournal', 'rw');
    rs.caching.enable('/prayerJournal/');
    // const widget = new ConnectWidget(rs);
    // widget.attach();

    return {
        rs,
        api: createApi({
            getCollection: function<T>(id): Collection<T> {
                // $FlowFixMe
                return rs.prayerJournal.getCollection<T>(id);
            },
            isConnected: () => rs.remote.connected,
            getUsername: () => rs.remote.userAddress,
            logout: () => rs.disconnect(),
        }),
        userState: initialUserStatus(rs),
    };
};

const reduce = (state, action) => {
    switch (action.type) {
        case 'login':
            const userState = action.status(state.userState);
            // console.log(state, action.status)
            return { ...state, userState };
        case 'logout':
            return { ...state, userState: loaded({ type: 'logged-out' }) };
    }
    return state;
};

const App = () => {
    const [state, dispatch] = React.useReducer(reduce, null, () =>
        getInitialState(),
    );

    React.useEffect(() => {
        const { rs } = state;
        rs.on('connected', () => {
            const userAddress = rs.remote.userAddress;
            dispatch({
                type: 'login',
                status: _ => loaded({ type: 'logged-in', user: rs.remote }),
            });
        });

        rs.on('disconnected', () => {
            dispatch({ type: 'logout' });
        });

        rs.on('network-offline', () => {
            console.log(`We're offline now.`);
        });

        rs.on('network-online', () => {
            console.log(`Hooray, we're back online.`);
        });
        console.log('initial');
    }, [state.rs]);

    if (
        state.userState.type === 'loaded' &&
        state.userState.data.type === 'logged-in'
    ) {
        window.user = state.userState.data.user;
        return <Shell api={state.api} />;
    } else {
        console.log(state);
        return (
            <LoginScreen
                loginStatus={state.userState}
                rs={state.rs}
                setLoginStatus={status => dispatch({ type: 'login', status })}
            />
        );
    }
};

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'));

// if ('serviceWorker' in navigator) {
//     // Use the window load event to keep the page load performant
//     window.addEventListener('load', () => {
//         if (!navigator.serviceWorker) {
//             return;
//         }
//         navigator.serviceWorker.register('../../sw.js');
//     });
// }
