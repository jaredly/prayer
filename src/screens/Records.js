// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../types';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';
import type { Route, Items, Types } from './Shell';
import Undo from 'react-ionicons/lib/MdUndo';
import ArrowBack from 'react-ionicons/lib/MdArrowBack';

export const useRecords = (api: PrayerJournalApi) => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        api.getRecords().then(
            items => setState(items),
            err => {},
        );
    }, []);
    return state;
};

const Records = ({
    types,
    items,
    setRoute,
    api,
}: {
    types: Types,
    items: Items,
    setRoute: (?Route) => void,
    api: PrayerJournalApi,
}) => {
    const records = useRecords(api);

    return (
        <div
            css={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                css={{
                    display: 'flex',
                    backgroundColor: Colors.accent,
                    alignItems: 'center',
                }}
            >
                <div onClick={() => setRoute(null)} css={{ padding: 16 }}>
                    <ArrowBack />
                </div>
                <div
                    css={{
                        padding: 16,
                    }}
                >
                    Archived items
                </div>
            </div>
            <div
                css={{
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                {Object.keys(records)
                    .filter(id => id !== 'tmp')
                    .sort(
                        (a, b) =>
                            records[a].createdDate - records[b].createdDate,
                    )
                    .map(k => (
                        <div>
                            <div
                                css={{
                                    backgroundColor: Colors.lightAccent,
                                    padding: '8px 16px',
                                    marginBottom: 8,
                                }}
                            >
                                {new Date(
                                    records[k].createdDate,
                                ).toLocaleString()}
                            </div>
                            <div css={{ padding: '0 16px' }}>
                                {Object.keys(records[k].notes)
                                    .filter(id => !!items[id])
                                    .map(id => (
                                        <div key={id}>
                                            <div
                                                css={{
                                                    fontStyle: 'italic',
                                                    marginBottom: 8,
                                                    marginTop: 8,
                                                    color: Colors.accentText,
                                                }}
                                            >
                                                {items[id].text}
                                            </div>
                                            <div>{records[k].notes[id]}</div>
                                        </div>
                                    ))}
                                {!!records[k].generalNotes ? (
                                    <div
                                        css={{
                                            marginTop: 8,
                                        }}
                                    >
                                        <div
                                            css={{
                                                fontStyle: 'italic',
                                                marginBottom: 8,
                                                marginTop: 8,
                                                color: Colors.accentText,
                                            }}
                                        >
                                            General notes
                                        </div>
                                        {records[k].generalNotes}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Records;
