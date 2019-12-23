// @flow

import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom'
import Gun from 'gun'
import "gun/sea"

import LoadingStateWrapper from './LoadingStateWrapper'
import {type LoadingState, type Result, startLoading, loaded, setFailed} from './loadingState'

const gun = new Gun(['https://gunjs-server.glitch.me/gun'])
window.gun=gun

const ponce = v => new Promise((res, rej) => v.once(ack => !ack || ack.err ? rej(ack) : res(ack)))

const login = async (user, username, password) => {
    console.log('logging in')
    const exists = await ponce(gun.get(`~@${username}`)).catch(err => false);
    if (!exists) {
        console.log('creating')
        await new Promise((res, rej) => user.create(username, password, ack => ack.err ? rej(new Error(ack.err)) : res(ack)))
        console.log('created')
    }
    await new Promise((res, rej) => user.auth(username, password, ack => ack.err ? rej(new Error(ack.err)) : res(ack)))
    user.recall({sessionStorage: true})
    console.log('logged in')
    return user
}

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

const useLoadingState = (initial) => {
    const data = initial != null ? {type: 'loaded', data: initial, fetchTime: Date.now(), refreshing: null} : {type: 'not-loaded'};
    const [state, setState] = React.useState(data);
    return [state, React.useMemo(() => ({
        promise: prom => {
            setState(startLoading);
            prom.then(
                value => {
                    setState(loaded(value))
                },
                error => {
                    setState(current => setFailed(current, error))
                }
            )
        },
        set: v => setState(loaded(v))
    }), [setState])]
}

const serializeUser = user => {
    const data = {
        is: user.is,
        sea: user._.sea,
        soul: user._.soul,
        put: user._.put,
    }
    return JSON.stringify(data)
}
const deserializeUser = (user, string) => {
    const data = JSON.parse(string);
    console.log(data)
    user.is = data.is
    user._.put = data.put
    user._.soul = user._.get = data.soul
    user._.sea = data.sea
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
            updateLoginStatus.promise(login(user, username, password).then(res => {
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
