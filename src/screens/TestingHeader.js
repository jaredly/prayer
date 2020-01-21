// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../types';
import Header from './Header';
import Adder from './Adder';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import Listing from './Listing';
import PrayerRecorder from './PrayerRecorder';
import LogOut from 'react-ionicons/lib/MdLogOut';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';
import type { Types, Sorted, Route } from './Shell';

window.testingData = {
    kinds: {},
    messages: [],
};

const buttons: Array<{
    title: string,
    action: PrayerJournalApi => Promise<void>,
}> = [
    {
        title: 'Add types in parallel',
        action: async api => {
            const r = Math.random()
                .toString(36)
                .slice(2);
            const promises = [];
            for (let i = 0; i < 100; i++) {
                const kind = {
                    id: r + '-' + i,
                    title: 'Type ' + i,
                    description: 'This is the description of type ' + i,
                    icon: '',
                };
                window.testingData.kinds[kind.id] = { ...kind };
                promises.push(api.putKind(kind));
            }
            await Promise.all(promises);
        },
    },
    {
        title: 'Add types in series',
        action: async api => {
            const r = Math.random()
                .toString(36)
                .slice(2);
            for (let i = 0; i < 100; i++) {
                const kind = {
                    id: r + '-' + i,
                    title: 'Type ' + i,
                    description: 'This is the description of type ' + i,
                    icon: '',
                };
                window.testingData.kinds[kind.id] = { ...kind };
                await api.putKind(kind);
            }
        },
    },
    {
        title: 'Mutate one thing 100 times (parallel)',
        action: async api => {
            const types = await api.getKinds();
            const k = Object.keys(types)[0];
            console.log('modifying', types[k]);
            const promises = [];
            for (let i = 0; i < 100; i++) {
                const title = 'Modified title ' + i;
                window.testingData.messages.push({
                    title,
                    id: k,
                    col: 'types',
                });
                promises.push(api.setKindTitle(types[k], title));
            }
            await Promise.all(promises);
        },
    },
    {
        title: 'Mutate one thing 100 times',
        action: async api => {
            const types = await api.getKinds();
            const k = Object.keys(types)[0];
            console.log('modifying', types[k]);
            for (let i = 0; i < 100; i++) {
                const title = 'Modified title ' + i;
                window.testingData.messages.push({
                    title,
                    id: k,
                    col: 'types',
                });
                await api.setKindTitle(types[k], title);
            }
        },
    },
];

export default ({ api }: { api: PrayerJournalApi }) => {
    const [loading, setLoading] = React.useState(false);
    return (
        <div>
            {buttons.map(({ title, action }) => (
                <button
                    disabled={loading}
                    style={{
                        border: '1px solid black',
                        margin: '4px',
                    }}
                    onClick={() => {
                        setLoading(true);
                        const start = Date.now();
                        action(api).then(
                            () => {
                                console.log(
                                    `Finished after ${(Date.now() - start) /
                                        1000}s`,
                                );
                                setLoading(false);
                            },
                            err => {
                                console.log('Failed!');
                                setLoading(false);
                            },
                        );
                    }}
                >
                    {title}
                </button>
            ))}
        </div>
    );
};
