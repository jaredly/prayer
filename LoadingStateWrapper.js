// @flow
import React, {type Node} from 'react'
import {type LoadingState, type Refreshing} from './loadingState'

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
