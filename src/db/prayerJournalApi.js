// @flow

import type { Collection, Backend } from './ApiInterface';

import { emptyRecord } from '../types';
import type { Item, Kind, Record } from '../types';

type Map<T> = { [key: string]: T };

export const createApi = (backend: Backend) => {
    const kinds: Collection<Kind> = backend.getCollection('kinds');
    const items: Collection<Item> = backend.getCollection('items');
    const records: Collection<Record> = backend.getCollection('records');

    const onAll = function<T>(
        collection: Collection<T>,
        fn: ({ [key: string]: T }) => void,
    ): () => void {
        let all = {};
        const unsub = collection.onChange((value, id) => {
            all = { ...all };
            if (value) {
                all[id] = value;
            } else {
                delete all[id];
            }
            fn(all);
        });
        collection.loadAll().then(got => {
            console.log('loaded', got);
            all = got;
            fn(all);
        });
        return unsub;
    };

    return {
        isConnected: () => backend.isConnected(),
        logout: () => backend.logout(),
        getUsername: () => backend.getUsername(),
        archiveItem: async (item: Item) => {
            const updated: Item = {
                ...item,
                active: false,
                activityHistory: item.activityHistory.concat([
                    { active: false, date: Date.now() },
                ]),
                modifiedDate: Date.now(),
            };
            await items.save(updated.id, updated);
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
            await items.save(updated.id, updated);
        },
        getTmpRecord: () => {
            return records
                .load('tmp')
                .then(v => {
                    if (!v) throw new Error('null');
                    return v;
                })
                .catch(err => emptyRecord());
        },
        putTmpRecord: async (record: Record) => {
            await records.save('tmp', {
                ...record,
                id: 'tmp',
            });
            return record;
        },
        discardTmpRecord: () => {
            return records.delete('tmp');
        },
        finishRecord: async (record: Record) => {
            record = {
                ...record,
                id: Math.random()
                    .toString(16)
                    .slice(2),
                finishedDate: Date.now(),
            };
            await Promise.all([
                records.save(record.id, record),
                records.delete('tmp'),
            ]);
            return record;
        },
        setKindTitle: async (kind: Kind, title: string) => {
            return kinds.setAttribute(kind.id, kind, 'title', title);
        },
        putKind: async (kind: Kind) => {
            await kinds.save(kind.id, kind);
            return kind;
        },
        putRecord: async (record: Record) => {
            await records.save(record.id, record);
            return record;
        },
        putItem: async (item: Item) => {
            await items.save(item.id, item);
            return item;
        },
        removeItem: async (id: string) => {
            await items.delete(id);
        },
        getKinds: (): Promise<{ [key: string]: Kind }> => {
            return new Promise((res, rej) =>
                kinds.loadAll().then(listing => {
                    res(listing);
                }),
            );
        },
        getRecords: (): Promise<{ [key: string]: Record }> => {
            return new Promise((res, rej) =>
                records.loadAll().then(listing => {
                    res(listing);
                }),
            );
        },
        getKind: (id: string) => kinds.load(id),
        onKinds: (fn: (Map<Kind>) => void) => onAll(kinds, fn),
        onItems: (fn: (Map<Item>) => void) => onAll(items, fn),
        onRecord: (id: string, fn: (?Record) => void) =>
            records.onItemChange(id, fn),
    };
};

type ExtractReturnType = <R>((b: Backend) => R) => R;
export type PrayerJournalApi = $Call<ExtractReturnType, typeof createApi>;
