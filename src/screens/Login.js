// @flow
import React from 'react'
import {type LoadingState} from '../loadingState'
import LoadingStateWrapper from '../LoadingStateWrapper'
import {useUser, type UserState} from '../user'
// import Gun from 'gun'
// magically adds the `Gun.user` stuff
// import "gun/sea"

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

const LoginScreen = ({gun, loginStatus, setLoginStatus}: {gun: any, loginStatus: LoadingState<UserState>, setLoginStatus: any}) => {
    // const user = window.user = React.useMemo(() => gun.user(), []);
    const onLogin = useUser(gun, loginStatus, setLoginStatus);

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

export default LoginScreen