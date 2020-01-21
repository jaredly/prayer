// @flow

// const useGunCollection = collection => {
//     const [state, setState] = React.useState({});
//     React.useMemo(() => {
//         collection.map().on((item, id) => {
//             setState(current => {
//                 const next = { ...current };
//                 if (!item) {
//                     delete next[id];
//                 } else {
//                     next[id] = item;
//                 }
//                 return next;
//             });
//         });
//     }, [collection]);
//     return state;
// };

const serdes = {
    items: {
        ser: item => {
            if (!item) return item;
            const thoughts = {};
            item.thoughts.forEach(t => {
                thoughts[t.date] = t;
            });
            return {
                ...item,
                activityHistory: JSON.stringify(item.activityHistory),
                thoughts,
            };
        },
        de: item => {
            if (!item) return item;
            return {
                ...item,
                activityHistory: JSON.parse(item.activityHistory),
                thoughts: Object.keys(item.thoughts).map(k => item.thoughts[k]),
            };
        },
    },
};

export default (gun: *) => ({
    getCollection: function<T>(col: string) {
        const collection = gun.get(col);
        const serialize = col === 'items';
        const serde = serdes[col];
        return {
            save: (id: string, value: T) => {
                const v = serde ? serde.ser(value) : value;
                console.log('saving', v);
                collection.set(v);
            },
            load: (id: string) =>
                new Promise<T>(res =>
                    collection.get(id).once(v => res(serde ? serde.de(v) : v)),
                ),
            loadAll: (): Promise<{ [key: string]: T }> => {
                // console.log(collection);
                // debugger;
                return new Promise(res =>
                    collection.once(map => {
                        if (!map) {
                            return res({});
                        }
                        const keys = Object.keys(map).filter(k => k !== '_');
                        // console.log('keys', keys);
                        return Promise.all(
                            keys.map(
                                k =>
                                    new Promise(res =>
                                        collection.get(k).once((v, b) => {
                                            res([k, v]);
                                        }),
                                    ),
                            ),
                        ).then(alls => {
                            const map = {};
                            alls.forEach(([k, v]) => {
                                if (!v) {
                                    return;
                                }
                                const keys = Object.keys(v).filter(
                                    k => k !== '_',
                                );
                                if (keys.length === 0) {
                                    return;
                                }
                                console.log(k, v);
                                // debugger;
                                map[k] = serde ? serde.de(v) : v;
                            });
                            // console.log(res);
                            res(map);
                        });
                    }),
                );
            },
            // new Promise(res =>
            //     collection.once((a, b, c) => console.log(a, b, c)),
            // ),
            delete: (id: string) => {
                collection.get(id).put(null);
            },
            onChange: (fn: (value: ?T, id: string) => void) => {
                collection.map().on((item, id) => {
                    fn(serde ? serde.de(item) : item, id);
                });
                return () => {};
            },
            onItemChange: (id: string, fn: (value: ?T) => void) => {
                collection.get(id).on(v => fn(serde ? serde.de(v) : v));
                return () => {};
            },
        };
    },
    isConnected: () => true,
    getUsername: () => 'hi',
    logout: () => {},
});
