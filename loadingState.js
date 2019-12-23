// @flow

export type Refreshing = ('background' | 'foreground')

export type LoadingState<T> =
    | {type: 'not-loaded'}
    | {
          type: 'loading',
      }
    | {
          type: 'loaded',
          // TODO(jared): Refactor this to use the {data, fetchTime} object that
          // the `failed` state uses.
          data: T,
          fetchTime: number,
          refreshing: ?Refreshing,
      }
    | {
          type: 'failed',
          error: Error,
          previous?: ?{
              data: T,
              fetchTime: number,
          },
      };

export function loaded<T>(data: T, fetchTime: number = Date.now()): LoadingState<T> {
    return {
        type: 'loaded',
        data,
        fetchTime,
        refreshing: null,
    };
}

export function setFailed<T>(current: LoadingState<T>, error: Error): LoadingState<T> {
    switch (current.type) {
        case 'not-loaded':
            return {type: 'failed', error, previous: null}
        case 'loading':
            return {type: 'failed', error, previous: null}
        case 'loaded':
            return {type: 'failed', error, previous: {data: current.data, fetchTime: current.fetchTime}}
        case 'failed':
            return {type: 'failed', error, previous: current.previous}
        default:
            throw new Error(`Unexpected loadingState type: ${(current.type: empty)}`)
    }
}

export function startLoading<T>(current: LoadingState<T>, background?: boolean): LoadingState<T> {
    switch (current.type) {
        case 'not-loaded':
            return {type: 'loading'}
        case 'loading':
            return {type: 'loading'}
        case 'loaded':
            return {...current, refreshing: mergeRefreshing(background ? 'background' : 'foreground')}
        case 'failed':
            if (current.previous) {
                return {type: 'loaded', data: current.previous.data, fetchTime: current.previous.fetchTime, refreshing: background ? 'background' : 'foreground'}
            } else {
                return {type: 'loading'}
            }
        default:
            throw new Error(`Unexpected loadingState type: ${(current.type: empty)}`)
    }
}

export function failed<T>(
    error: Error,
    previous?: ?{ data: T, fetchTime: number },
): LoadingState<T> {
    return {
        type: 'failed',
        error,
        previous,
    };
}
export const notLoaded = {type: 'not-loaded'};
export const loading = {type: 'loading', promise: null};

/// ## Utils for dealing with "LoadingState" values ##
///
/// Often, you want to do something with the contents of a "LoadingState", if
/// it is in fact loaded. If you have multiple "LoadingState"s, you generally
/// want to do something with all of their contents.
///
/// If these were Promises, then you'd `await` all of them, or maybe `Promise.all`.
/// This is basically doing `Promise.all` for `LoadingState`s, in a way that keeps
/// flow happy so we still get full type safety.
///
/// The return value of these functions is a new LoadingState, where if the input
/// was `loaded`, the function gets called with the contents, and if not, then the
/// original is returned.
///
/// For the functions that take multiple `LoadingState`s, then if any one of them
/// is `failed`, then that failure is returned (there is no merging of errors).
/// Otherwise, if any of them are `loading` or `not-loaded`, then that is returned.
///
/// (for you haskell programmers out there, yes, this is "monadic bind" for
/// LoadingState)

// TODO (bryan): I'm pretty sure we can delete this!
export const transformLoadedValue = <T, R>(
    loadingState: LoadingState<T>,
    fn: (T, ?Error) => LoadingState<R>,
): LoadingState<R> => {
    if (loadingState.type === 'loaded') {
        return fn(loadingState.data, null);
    } else if (loadingState.type === 'failed') {
        if (loadingState.previous) {
            return fn(loadingState.previous.data, loadingState.error);
        }
        return failed(loadingState.error);
    } else {
        return loadingState;
    }
};

/**
 * Returns the data from a `LoadingState<T>` object. If the object is in a
 * failed state, it returns the data that was loaded previously. Otherwise it
 * returns `null`.
 */
export function getLoaded <T>(
    loadingState: LoadingState<T>,
): ?{data: T, fetchTime: number} {
    switch (loadingState.type) {
        case 'loaded':
            return {data: loadingState.data, fetchTime: loadingState.fetchTime};
        case 'failed':
            return loadingState.previous;
        default:
            return null;
    }
};

export function combineLoadedValues <Type1, Type2>(
    state1: LoadingState<Type1>,
    state2: LoadingState<Type2>,
): LoadingState<[Type1, Type2]> {
    const state1loaded = getLoaded(state1);
    const state2loaded = getLoaded(state2);

    const combinedData =
        state1loaded && state2loaded
            ? {
                  data: [state1loaded.data, state2loaded.data],
                  fetchTime: Math.min(
                      state1loaded.fetchTime,
                      state2loaded.fetchTime,
                  ),
              }
            : null;

    if (state1.type === 'failed') {
        return {
            type: 'failed',
            previous: combinedData,
            error: state1.error,
        };
    }
    if (state2.type === 'failed') {
        return {
            type: 'failed',
            previous: combinedData,
            error: state2.error,
        };
    }
    if (state1.type !== 'loaded') {
        return state1;
    }
    if (state2.type !== 'loaded') {
        return state2;
    }
    return {
        type: 'loaded',
        fetchTime: Math.min(state1.fetchTime, state2.fetchTime),
        refreshing: mergeRefreshing(state1.refreshing, state2.refreshing),
        data: [state1.data, state2.data],
    };
};

const mergeRefreshing = (first, second) => {
    if (!first) {
        return second;
    }
    if (!second) {
        return first;
    }
    // foreground overrides a background
    if (first === 'foreground' || second === 'foreground') {
        return 'foreground';
    }
    return 'background';
};

/**
 * Maps the `data` key of the given `LoadingState<T>` if loaded, otherwise just
 * returns it unchanged (if `type='failed'` the `previous` is always
 * undefined).
 */
export const mapLoadedValueWithFailure = <T, R>(
    loadingState: LoadingState<T>,
    fn: T => Result<R>,
): LoadingState<R> => {
    if (loadingState.type === 'loaded') {
        const result = fn(loadingState.data);
        if (result.type === 'ok') {
            return {
                type: 'loaded',
                fetchTime: loadingState.fetchTime,
                refreshing: loadingState.refreshing,
                data: result.data,
            };
        } else {
            return failed(result.error);
        }
    } else if (loadingState.type === 'failed') {
        const {previous} = loadingState;
        if (previous) {
            const result = fn(previous.data);
            if (result.type === 'ok') {
                return {
                    type: 'failed',
                    previous: {
                        data: result.data,
                        fetchTime: previous.fetchTime,
                    },
                    error: loadingState.error,
                };
            } else {
                return failed(result.error);
            }
        }
        return failed(loadingState.error);
    }

    return loadingState;
};

/**
 * Maps the `data` key of the given `LoadingState<T>` if loaded, or if it's
 * `failed` and there's previous data, map that.
 */
export const mapLoadedValue = <T, R>(
    loadingState: LoadingState<T>,
    fn: T => R,
): LoadingState<R> => {
    if (loadingState.type === 'loaded') {
        return {
            type: 'loaded',
            data: fn(loadingState.data),
            fetchTime: loadingState.fetchTime,
            refreshing: loadingState.refreshing,
        };
    } else if (loadingState.type === 'failed') {
        return {
            type: 'failed',
            error: loadingState.error,
            previous:
                loadingState.previous != null
                    ? {
                          fetchTime: loadingState.previous.fetchTime,
                          data: fn(loadingState.previous.data),
                      }
                    : null,
        };
    } else {
        return loadingState;
    }
};

/**
 * Queries the given loading state to see if it's in a refreshing state
 * (ie. data has been loaded, but it's being refreshed).
 */
export function isRefreshing <T>(loadingState: LoadingState<T>): boolean {
    return loadingState.type === 'loaded' && !!loadingState.refreshing;
};

/**
 * Queries the given loading state to see if it's in a visible refresh state
 * (ie. data has been loaded, but it's being refreshed).
 */
export function isVisiblyRefreshing <T>(
    loadingState: LoadingState<T>,
): boolean {
    return isRefreshing(loadingState) &&
    (loadingState.type === 'loaded' &&
        loadingState.refreshing === 'foreground');
}

export type Result<T> =
    | {
          type: 'ok',
          data: T,
      }
    | {
          type: 'failed',
          error: Error,
      };

export const ok = <T>(data: T): Result<T> => ({type: 'ok', data});
export const error = <T>(error: Error): Result<T> => ({type: 'failed', error});

