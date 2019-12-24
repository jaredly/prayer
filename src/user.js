// @flow
import LoadingStateWrapper, {wrapLoadingState} from './LoadingStateWrapper'
import {type LoadingState, loaded} from './loadingState'
import React from 'react'
import {login} from './api'

const serializeUser = user => {
    return JSON.stringify(user._.sea)
}
const deserializeUser = (user, string) => {
    const data = JSON.parse(string);
    user.auth(data)
}

export type UserState = {type: 'logged-out'} | {type: 'logged-in', user: any};

export const initialUserStatus = (gun: any): LoadingState<UserState> => {
    if (window.localStorage.user) {
        const user = gun.user()
        // user.recall({sessionStorage: true})
        deserializeUser(user, window.localStorage.user)
        return loaded({type: 'logged-in', user})
    } else {
        return loaded({type: 'logged-out'})
    }
}

export const useUser = (gun: any, loginStatus: LoadingState<UserState>, setLoginStatus: any): ((string, string) => void) => {
    const updateLoginStatus = wrapLoadingState(loginStatus, setLoginStatus);

    const onLogin = React.useCallback(
        (username: string, password: string) => {
            const user = gun.user();
            updateLoginStatus(login(gun, user, username, password).then(res => {
                window.localStorage.user = serializeUser(user)
                return {type: 'logged-in', user: user}
            }))
        },
        [],
    );
    return onLogin
}