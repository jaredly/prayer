// @flow

import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom'
// import Gun from 'gun'
// magically adds the `Gun.user` stuff
// import "gun/sea"

import LoadingStateWrapper, {useLoadingState} from './LoadingStateWrapper'
import {loaded} from './loadingState'
import {useUser, type UserState, initialUserStatus} from './user'
import LoginScreen from './screens/Login'
import HomeScreen from './screens/Home'
import prayerJournalModule from './prayerJournalModule'

import RemoteStorage from 'remotestoragejs';
import ConnectWidget from 'remotestorage-widget';

type AppState = {
    rs: any,
    userState: UserState,
}

const getInitialState = (rs) => {
    window.rs = rs
    rs.access.claim('prayerJournal', 'rw');
    rs.caching.enable('/prayerJournal/')
    const widget = new ConnectWidget(rs);
    widget.attach();

    return {
        rs,
        userState: initialUserStatus(rs)
    }
}

const reduce = (state, action) => {
    switch (action.type) {
        case 'login':
            const userState = action.status(state.userState)
            // console.log(state, action.status)
            return {...state, userState}
    }
    return state
}

const App = () => {
    const [state, dispatch] = React.useReducer(reduce, null, () =>
        getInitialState(new RemoteStorage({
            modules: [prayerJournalModule],
            changeEvents: {
                local:    true,
                window:   true,
                remote:   true,
                conflict: true
            },
        })),
    );

    React.useEffect(() => {
        const {rs} = state;
        rs.on('connected', () => {
            const userAddress = rs.remote.userAddress;
            dispatch({type: 'login', status: () => loaded({type: 'logged-in', user: rs.remote})})
        })

        rs.on('network-offline', () => {
            console.log(`We're offline now.`);
        });

        rs.on('network-online', () => {
            console.log(`Hooray, we're back online.`);
        });
        console.log('initial')
    }, [state.rs])

    if (
        state.userState.type === 'loaded' &&
        state.userState.data.type === 'logged-in'
    ) {
        window.user = state.userState.data.user
        return <HomeScreen rs={state.rs} />;
    } else {
        console.log(state)
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
ReactDOM.render(<App />, document.getElementById('root'))
