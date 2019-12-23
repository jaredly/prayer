// @flow

import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom'
import Gun from 'gun'
import "gun/sea"

import LoadingStateWrapper, {useLoadingState} from './LoadingStateWrapper'
import {login} from './api'

const gun = new Gun(['https://gunjs-server.glitch.me/gunz'])
window.gun = gun

type UserState = {type: 'logged-out'} | {type: 'logged-in', user: any};

const Login = ({onLogin, error, loading}: {onLogin: (string, string) => void, error?: Error, loading?: boolean}) => {
    const [username, setUsername] = React.useState(null)
    const [password, setPassword] = React.useState(null)

    return <div>
        <input value={username || ''} onChange={evt => setUsername(evt.target.value)} />
        <input value={password || ''} onChange={evt => setPassword(evt.target.value)} />
        <button onClick={() => username && password ? onLogin(username, password) : null}
        disabled={!username || !password || loading}
        >
            Log in
        </button>
        {error ? error.message : null}
    </div>
}

const serializeUser = user => {
    return JSON.stringify(user.is)
}
const deserializeUser = (user, string) => {
    const data = JSON.parse(string);
    user.auth(data)
}

const initialUserStatus = (user) => {
    if (window.localStorage.user) {
        deserializeUser(user, window.localStorage.user)
        return {type: 'logged-in', user}
    } else {
        return {type: 'logged-out'}
    }
}

const App = () => {
    const user = window.user = React.useMemo(() => gun.user(), []);
    const [loginStatus, updateLoginStatus] = useLoadingState(initialUserStatus(user));

    const onLogin = React.useCallback(
        (username, password) =>
            updateLoginStatus.promise(login(gun, user, username, password).then(res => {
                window.localStorage.user = serializeUser(user)
                return res
            })),
        [],
    );

    return <LoadingStateWrapper
        state={loginStatus}
        failed={err => <Login onLogin={onLogin} error={err} />}
        loaded={(status, refreshing) => {
            if (status.type === 'logged-out') {
                return <Login onLogin={onLogin} loading={!!refreshing} />
            } else {
                return 'Logged in!'
            }
        }}
        loading={() => "Loading..."}
    />
}

// $FlowFixMe
ReactDOM.render(<App />, document.getElementById('root'))
