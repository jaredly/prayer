// @flow

import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom'
import Gun from 'gun'
import {type LoadingState, type Result, startLoading, loaded, setFailed} from './loadingState'

const gun = new Gun(['https://gunjs-server.glitch.me/gun'])

const ponce = v => new Promise((res, rej) => v.once(ack => ack.err ? rej(ack) : res(ack)))

const login = async (gun, username, password) => {
    const exists = await ponce(gun.get(`~@${username}`)).catch(err => false);
    const user = gun.user();
    if (!exists) {
        await new Promise((res, rej) => user.create(username, password, ack => ack.err ? rej(ack) : res(ack)))
    }
    await new Promise((res, rej) => user.auth(username, password, ack => ack.err ? rej(ack) : res(ack)))
    return user
}

const Login = ({onLogin}) => {
    const [username, setUsername] = React.useState(null)
    const [password, setPassword] = React.useState(null)

    return <div>
        <input value={username} onChange={evt => setUsername(evt.target.value)} />
        <input value={password} onChange={evt => setPassword(evt.target.value)} />
        <button onClick={() => onLogin(username, password)}>
            Log in
        </button>
    </div>
}

const useLoadingState = (initial) => {
    const data = initial != null ? {type: 'loaded', data: initial, fetchTime: Date.now(), refreshing: null} : {type: 'not-loaded'};
    const [state, setState] = React.useState(data);
    return React.callback(prom => {
        setState(startLoading);
        prom.then(
            value => {
                setState(loaded(value))
            },
            error => {
                setState(current => setFailed(current, error))
            }
        )
    })
}

const App = () => {
    const [loginStatus, updateLoginStatus] = React.useReducer(loadingStateReducer, )

    return <div>
        <Login />
    </div>
}

ReactDOM.render(<App />, document.getElementById('root'))


// document.querySelector('form').addEventListener('submit', function (event) {
//     event.preventDefault()
//     var input = document.getElementById('input')
//     gun.get('hello').put({ name: input.value });
//     input.value = ''
//   })

//   gun.get('hello').on(function(data, key) {
//     var h1 = document.getElementById("output")
//     h1.textContent = 'Hello ' + data.name
//   })
