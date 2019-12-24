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

type AppState = {
    gun: any,
    userState: UserState,
}

const getInitialState = (gun) => {
    return {
        gun,
        userState: initialUserStatus(gun)
    }
}

const reduce = (state, action) => {
    switch (action.type) {
        case 'login':
            return {...state, userState: action.status}
    }
    return state
}

const App = () => {
    const [state, dispatch] = React.useReducer(reduce, null, () => getInitialState(new Gun(['https://gunjs-server.glitch.me/gunz'])));

    if (state.userState.type === 'logged-in') {
        return "Ok!"
    } else {
        return <LoginScreen loginStatus={state.userState} gun={state.gun} setLoginStatus={status => dispatch({type: 'login', status})} />
    }
}

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'))
