// @flow
import React, {type Node} from 'react'
import {type LoadingState, type Refreshing} from './loadingState'
import {type Result, startLoading, loaded, setFailed} from './loadingState'

export function useLoadingState <T>(initial: () => T): [LoadingState<T>, {
    promise: (Promise<T>) => void,
    set: (T) => void,
}] {
    const [state, setState] = React.useState(() => {
        const initialData = initial();
        return initialData != null ? {type: 'loaded', data: initialData, fetchTime: Date.now(), refreshing: null} : {type: 'not-loaded'};
    });
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

type Props<T> = {
    state: LoadingState<T>,
    initial?: () => Node,
    loading: () => Node,
    loaded: (data: T, refreshing: ?Refreshing) => Node,
    failed: (error: Error, previous: ?T) => Node,
}

function Wrapper<T>({state, initial, loading, loaded, failed}: Props<T>) {
    switch (state.type) {
        case 'not-loaded':
            if (initial) {
                return initial()
            } else {
                return loading()
            }
        case 'loading':
            return loading()
        case 'loaded':
            return loaded(state.data, state.refreshing)
        case 'failed':
            return failed(state.error, state.previous ? state.previous.data : null)
        default:
            throw new Error('Invalid loading state')
    }
}

export default Wrapper
