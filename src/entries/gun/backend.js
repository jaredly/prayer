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

export default gun => ({
    getCollection: function<T>(col: string) {
        const collection = gun.get(col);
        const kind = {
            items: 'item',
            kinds: 'item-kind',
            records: 'record',
        }[col];
        const getPath = {
            items: itemPath,
            kinds: kindPath,
            records: recordPath,
        }[col];
        return {
            save: (id: string, value: T) => collection.set(value),
            load: (id: string) => collection.get(id),
            // loadAll: () => collection.map().once(bb)
            delete: (id: string) => collection.delete(id),
            onChange: (fn: (value: ?T, id: string) => void) => {
                const listener = evt => {
                    const [one, id] = evt.relativePath.split('/');
                    if (one !== col) {
                        return;
                    }
                    fn(evt.newValue, id);
                };
                priv.on('change', listener);
                return () => {
                    priv.off('change', listener);
                };
                // return onPath(getPath(''), fn);
            },
            onItemChange: (id: string, fn: (value: ?T) => void) => {
                return onObject(getPath(id), fn);
            },
        };
    },
});
