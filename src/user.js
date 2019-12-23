// @flow
import LoadingStateWrapper, {useLoadingState} from './LoadingStateWrapper'
import {type LoadingState} from './loadingState'
import React from 'react'
import {login} from './api'

const serializeUser = user => {
    return JSON.stringify(user.is)
}
const deserializeUser = (user, string) => {
    const data = JSON.parse(string);
    user.auth(data)
}

export type UserState = {type: 'logged-out'} | {type: 'logged-in', user: any};

const initialUserStatus = (user) => {
    if (window.localStorage.user) {
        deserializeUser(user, window.localStorage.user)
        return {type: 'logged-in', user}
    } else {
        return {type: 'logged-out'}
    }
}
export const useUser = (gun: any, user: any): [LoadingState<UserState>, (string, string) => void] => {
    const [loginStatus, updateLoginStatus] = useLoadingState(() => initialUserStatus(user));

    const onLogin = React.useCallback(
        (username: string, password: string) =>
            updateLoginStatus.promise(login(gun, user, username, password).then(res => {
                window.localStorage.user = serializeUser(user)
                return res
            })),
        [],
    );
    return [loginStatus, onLogin]
}