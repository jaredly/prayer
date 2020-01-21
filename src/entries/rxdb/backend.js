// @flow
import RxDB from 'rxdb';
import {
    itemSchema,
    itemKindSchema,
    recordSchema,
    emptyRecord,
} from '../../types';
import type { Backend, Collection } from '../../db/apiInterface';

const schemas = {
    items: itemSchema,
    kinds: itemKindSchema,
    records: recordSchema,
};

export default (db: Promise<any>): Backend => {
    return {
        getCollection: function<T>(id: string): Collection<T> {
            const cprom = db.then(async db => {
                const collection = await db.collection({
                    name: id,
                    schema: schemas[id],
                });

                console.log(id);
                const replicationState = collection.sync({
                    remote: 'http://localhost:9102/' + id,
                });
                return collection;
            });
            return {
                setAttribute: async (
                    id: string,
                    full: *,
                    key: string,
                    value: *,
                ) => {
                    const col = await cprom;
                    // NOTE value must contain the ID
                    col.atomicUpsert({
                        id,
                        [key]: value,
                    });
                },
                save: async (id: string, value: *) => {
                    const col = await cprom;
                    // NOTE value must contain the ID
                    col.atomicUpsert(value);
                },
                load: async (id: string) => {
                    const col = await cprom;
                    return col
                        .findOne(id)
                        .exec()
                        .then(v => v.toJSON());
                },
                loadAll: async () => {
                    const col = await cprom;
                    return col.find().exec();
                },
                delete: async (id: string) => {
                    const col = await cprom;
                    return col.findOne(id).remove();
                },
                onChange: (fn: (value: ?*, id: string) => void) => {
                    let unsub = () => {};
                    cprom.then(col => {
                        // const values = await col.find().exec();
                        // const map = {};
                        // values.forEach(v => (map[v.id] = v));
                        // fn(map)
                        const sub = col.$.subscribe(changeEvent => {
                            console.log(changeEvent);
                            if (
                                changeEvent.data.op === 'INSERT' ||
                                changeEvent.data.op === 'UPDATE'
                            ) {
                                fn(changeEvent.data.v, changeEvent.data.v.id);
                                // map[changeEvent.data.value.id] =
                                //     changeEvent.data.value;
                            } else if (changeEvent.data.op === 'REMOVE') {
                                fn(null, changeEvent.data.doc);
                                // delete map[changeEvent.data.doc];
                            }
                            // fn(map);
                        });
                        unsub = () => sub.unsubscribe();
                    });
                    return () => {
                        unsub();
                    };
                },
                onItemChange: (id: string, fn: (value: ?*) => void) => {
                    let unsub = () => {};
                    cprom.then(col => {
                        const sub = col.$.subscribe(changeEvent => {
                            console.log(changeEvent);
                            if (changeEvent.data.doc !== id) {
                                return;
                            }
                            if (
                                changeEvent.data.op === 'INSERT' ||
                                changeEvent.data.op === 'UPDATE'
                            ) {
                                fn(changeEvent.data.v);
                            } else if (changeEvent.data.op === 'REMOVE') {
                                fn(null);
                            }
                        });
                        unsub = () => sub.unsubscribe();
                    });
                    return () => {
                        unsub();
                    };
                },
            };
        },
        isConnected: () => true,
        getUsername: () => 'hi',
        logout: () => {},
    };
};
