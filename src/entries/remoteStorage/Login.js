// @flow
import React from 'react';
import { type LoadingState } from '../../loadingState';
import LoadingStateWrapper from '../../LoadingStateWrapper';
import { type UserState } from './';
import type { PrayerJournalApi } from '../../db/PrayerJournalApi';
import type { RemoteStorageT } from './';
// import Gun from 'gun'
// magically adds the `Gun.user` stuff
// import "gun/sea"
import ConnectWidget from 'remotestorage-widget';

const Login = ({ rs }: { rs: RemoteStorageT }) => {
    const ref = React.useRef(null);
    const id = React.useMemo(() =>
        Math.random()
            .toString(16)
            .slice(2),
    );
    React.useEffect(() => {
        if (ref.current) {
            const widget = new ConnectWidget(rs);
            widget.attach(id);
        }
    }, [ref.current]);

    return <div ref={ref} id={id} />;
};

// const Login = ({onLogin, error, loading}: {onLogin: (string, string) => void, error?: Error, loading?: boolean}) => {
//     const [username, setUsername] = React.useState(null)
//     const [password, setPassword] = React.useState(null)

//     return <div>
//         <input value={username || ''} onChange={evt => setUsername(evt.target.value)} />
//         <input value={password || ''} onChange={evt => setPassword(evt.target.value)} />
//         <button onClick={() => username && password ? onLogin(username, password) : null}
//         disabled={!username || !password || loading}
//         >
//             Log in
//         </button>
//         {error ? error.message : null}
//     </div>
// }

const LoginScreen = ({
    rs,
    loginStatus,
    setLoginStatus,
}: {
    rs: RemoteStorageT,
    loginStatus: LoadingState<UserState>,
    setLoginStatus: any,
}) => {
    // const user = window.user = React.useMemo(() => gun.user(), []);
    // const onLogin = useUser(gun, loginStatus, setLoginStatus);

    return (
        <LoadingStateWrapper
            state={loginStatus}
            failed={err => <Login rs={rs} />}
            loaded={(status, refreshing) => {
                if (status.type === 'logged-out') {
                    return <Login rs={rs} />;
                } else {
                    return 'Logged in!';
                }
            }}
            loading={() => 'Loading...'}
        />
    );
};

export default LoginScreen;
