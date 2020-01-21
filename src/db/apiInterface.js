// @flow

export type Collection<T> = {
    save: (id: string, value: T) => Promise<void>,
    setAttribute: (
        id: string,
        full: T,
        key: string,
        value: any,
    ) => Promise<void>,
    load: (id: string) => Promise<?T>,
    loadAll: () => Promise<{ [key: string]: T }>,
    delete: (id: string) => Promise<void>,
    onChange: ((value: ?T, id: string) => void) => () => void,
    onItemChange: (id: string, (value: ?T) => void) => () => void,
};

export type Backend = {
    getCollection: <T>(id: string) => Collection<T>,
    isConnected: () => boolean,
    getUsername: () => string,
    logout: () => void,
};
