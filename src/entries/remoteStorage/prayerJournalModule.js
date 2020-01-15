// @flow

type Map<T> = { [key: string]: T };

import {
    itemSchema,
    itemKindSchema,
    recordSchema,
    emptyRecord,
} from '../../types';
import type { Item, Kind, Record } from '../../types';

const prayerJournalModule = {
    name: 'prayerJournal',
    builder: (priv: any, pub: any) => {
        priv.declareType('item', itemSchema);
        priv.declareType('item-kind', itemKindSchema);
        priv.declareType('record', recordSchema);

        const kindPath = id => `kinds/${id}`;
        const itemPath = id => `items/${id}`;
        const recordPath = id => `records/${id}`;
        window.priv = priv;

        const onObject = (path, fn) => {
            priv.getObject(path).then(
                obj => fn(obj),
                err => {},
            );
            const listener = evt => {
                if (evt.relativePath !== path) {
                    return;
                }
                fn(evt.newValue);
            };
            priv.on('change', listener);
            return () => {
                priv.off('change', listener);
            };
        };

        const onPath = (path, fn) => {
            let data = {};
            priv.getAll(path + '/').then(listing => {
                data = listing;
                console.log('got', path, listing);
                fn(listing);
            });
            const listener = evt => {
                const [one, id] = evt.relativePath.split('/');
                if (one !== path) {
                    return;
                }
                data = { ...data, [id]: evt.newValue };
                if (!evt.newValue) {
                    delete data[id];
                }
                fn(data);
            };
            priv.on('change', listener);
            return () => {
                priv.off('change', listener);
            };
        };

        return {
            exports: {
                getCollection: function<T>(col: string) {
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
                        save: (id: string, value: T) =>
                            priv.storeObject(kind, getPath(id), value),
                        load: (id: string) => priv.getObject(getPath(id)),
                        loadAll: () => priv.getAll(getPath('')),
                        delete: (id: string) => priv.remove(getPath(id)),
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
                archiveItem: async (item: Item) => {
                    const updated: Item = {
                        ...item,
                        active: false,
                        activityHistory: item.activityHistory.concat([
                            { active: false, date: Date.now() },
                        ]),
                        modifiedDate: Date.now(),
                    };
                    await priv.storeObject(
                        'item',
                        itemPath(updated.id),
                        updated,
                    );
                },
                unarchiveItem: async (item: Item) => {
                    const updated: Item = {
                        ...item,
                        active: true,
                        activityHistory: item.activityHistory.concat([
                            { active: true, date: Date.now() },
                        ]),
                        modifiedDate: Date.now(),
                    };
                    await priv.storeObject(
                        'item',
                        itemPath(updated.id),
                        updated,
                    );
                },
                getTmpRecord: () => {
                    return priv
                        .getObject(recordPath('tmp'))
                        .then(v => {
                            if (!v) throw new Error('null');
                            return v;
                        })
                        .catch(err => emptyRecord());
                },
                putTmpRecord: async (record: Record) => {
                    var path = recordPath('tmp');
                    await priv.storeObject('record', path, {
                        ...record,
                        id: 'tmp',
                    });
                    return record;
                },
                discardTmpRecord: () => {
                    return priv.remove(recordPath('tmp'));
                },
                finishRecord: async (record: Record) => {
                    record = {
                        ...record,
                        id: Math.random()
                            .toString(16)
                            .slice(2),
                        finishedDate: Date.now(),
                    };
                    const path = recordPath(record.id);
                    await Promise.all([
                        priv.storeObject('record', path, record),
                        priv.remove(recordPath('tmp')),
                    ]);
                    return record;
                },
                putKind: async (kind: Kind) => {
                    var path = kindPath(kind.id); // use hashed URL as filename as well
                    await priv.storeObject('item-kind', path, kind);
                    return kind;
                },
                putRecord: async (record: Record) => {
                    var path = recordPath(record.id);
                    await priv.storeObject('record', path, record);
                    return record;
                },
                putItem: async (item: Item) => {
                    var path = itemPath(item.id);
                    await priv.storeObject('item', path, item);
                    return item;
                },
                removeItem: async (id: string) => {
                    await priv.remove(itemPath(id));
                },
                getRecords: (): Promise<{ [key: string]: Record }> => {
                    return new Promise((res, rej) =>
                        priv.getAll('records/').then(listing => {
                            res(listing);
                        }),
                    );
                },
                getKind: (id: string) => priv.getObject(kindPath(id)),
                onKinds: (fn: (Map<Kind>) => void) => onPath('kinds', fn),
                onItems: (fn: (Map<Item>) => void) => onPath('items', fn),
                onItems: (fn: (Map<Item>) => void) => onPath('items', fn),
                onRecord: (id: string, fn: (Map<Item>) => void) =>
                    onObject(recordPath(id), fn),
            },
        };
    },
};

type ExtractReturnType = <R>((any, any) => R) => R;
export type PrayerJournalModuleType = $PropertyType<
    $Call<ExtractReturnType, typeof prayerJournalModule.builder>,
    'exports',
>;

export default prayerJournalModule;
