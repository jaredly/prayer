// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../types';
import Header from './Header';
import Adder from './Adder';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';

export const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

const Listing = ({
    types,
    onAdd,
    setShowing,
    sorted,
    api,
}: {
    types: { [key: string]: Kind },
    onAdd: string => void,
    setShowing: string => void,
    sorted: { [key: string]: Array<Item> },
    api: PrayerJournalApi,
}) => {
    if (Object.keys(types).length === 0) {
        return (
            <div>
                <div style={{ display: 'flex' }}>
                    {defaultTypes.map((t, i) => (
                        <div key={i}>{t.title}</div>
                    ))}
                </div>
                <button
                    onClick={() => {
                        defaultTypes.forEach(t => {
                            api.putKind(t);
                        });
                    }}
                >
                    Add default item types
                </button>
            </div>
        );
    }

    return (
        <>
            {Object.keys(types)
                .sort((a, b) => cmp(types[a].title, types[b].title))
                .map(id => (
                    <div
                        key={id}
                        css={
                            {
                                // padding: '8px 16px',
                            }
                        }
                    >
                        <div
                            css={{
                                fontSize: '80%',
                                padding: '4px 8px',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            {types[id].title}
                            <button
                                onClick={() => onAdd(id)}
                                css={{
                                    // alignSelf: 'stretch',
                                    // width: '100%',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    textAlign: 'left',
                                    fontSize: 'inherit',
                                    padding: '4px 8px',
                                    '&:hover': {
                                        backgroundColor: Colors.hover,
                                    },
                                    '&:active': {
                                        backgroundColor: Colors.hover,
                                    },
                                }}
                            >
                                ➕ add
                            </button>
                        </div>
                        <div
                            css={{
                                borderTop: '4px',
                                // display: 'flex',
                                // flexDirection: 'column',
                            }}
                        >
                            {(sorted[id] || []).map(item => (
                                <div
                                    onClick={() => setShowing(item.id)}
                                    css={{
                                        padding: '8px 16px',
                                        '&:hover': {
                                            backgroundColor: Colors.hover,
                                        },
                                        '&:active': {
                                            backgroundColor: Colors.hover,
                                        },
                                    }}
                                    key={item.id}
                                >
                                    {maybeBlank(item.text)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </>
    );
};

export default Listing;
