// @flow

import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
// import Gun from 'gun'
// magically adds the `Gun.user` stuff
// import "gun/sea"

import LoadingStateWrapper, { useLoadingState } from './LoadingStateWrapper';
import { loaded } from './loadingState';
import { useUser, type UserState, initialUserStatus } from './user';
import LoginScreen from './screens/Login';
import HomeScreen from './screens/Home';
import prayerJournalModule, {
    type PrayerJournalModuleType,
} from './prayerJournalModule';

import RemoteStorage from 'remotestoragejs';

export type RemoteStorageT = {
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
    rs: RemoteStorageT,
    userState: UserState,
};

const getInitialState = (rs: RemoteStorageT) => {
    window.rs = rs;
    rs.access.claim('prayerJournal', 'rw');
    rs.caching.enable('/prayerJournal/');
    // const widget = new ConnectWidget(rs);
    // widget.attach();

    return {
        rs,
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
        getInitialState(
            new RemoteStorage({
                modules: [prayerJournalModule],
                changeEvents: {
                    local: true,
                    window: true,
                    remote: true,
                    conflict: true,
                },
            }),
        ),
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
        return <HomeScreen rs={state.rs} />;
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
