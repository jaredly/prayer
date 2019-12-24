// @flow

import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom'
import Gun from 'gun'
// magically adds the `Gun.user` stuff
import "gun/sea"

import LoadingStateWrapper, {useLoadingState} from './LoadingStateWrapper'
import {useUser, type UserState, initialUserStatus} from './user'
import LoginScreen from './screens/Login'
import HomeScreen from './screens/Home'

type AppState = {
    gun: any,
    userState: UserState,
}

const getInitialState = (gun) => {
    window.gun = gun
    return {
        gun,
        userState: initialUserStatus(gun)
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
        getInitialState(new Gun(['https://gunjs-server.glitch.me/gunz'])),
    );

    if (
        state.userState.type === 'loaded' &&
        state.userState.data.type === 'logged-in'
    ) {
        window.user = state.userState.data.user
        return <HomeScreen user={state.userState.data.user} />;
    } else {
        console.log(state)
        return (
            <LoginScreen
                loginStatus={state.userState}
                gun={state.gun}
                setLoginStatus={status => dispatch({ type: 'login', status })}
            />
        );
    }
};

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'))
