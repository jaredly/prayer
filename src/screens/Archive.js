// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../prayerJournalModule';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import type { RemoteStorageT } from '../';
import type { Route, Items, Types } from './Shell';
import Undo from 'react-ionicons/lib/MdUndo';
import ArrowBack from 'react-ionicons/lib/MdArrowBack';

const Archive = ({
    types,
    items,
    setRoute,
    rs,
}: {
    types: Types,
    items: Items,
    setRoute: (?Route) => void,
    rs: RemoteStorageT,
}) => {
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
                {Object.keys(items)
                    .filter(k => !items[k].active)
                    .sort(
                        (a, b) =>
                            (items[b].modifiedDate || items[b].createdDate) -
                            (items[a].modifiedDate || items[a].createdDate),
                    )
                    .map(id => (
                        <div
                            css={
                                {
                                    // padding: '8px 16px',
                                }
                            }
                            key={id}
                        >
                            <div
                                css={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <div
                                    css={{
                                        flex: 1,
                                        fontSize: 16,
                                        padding: '16px',
                                    }}
                                >
                                    {maybeBlank(items[id].text)}
                                    <div
                                        css={{ fontSize: '80%', marginTop: 8 }}
                                    >
                                        {new Date(
                                            items[id].modifiedDate ||
                                                items[id].createdDate,
                                        ).toDateString()}
                                    </div>
                                </div>
                                <button
                                    css={{
                                        padding: '16px 20px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        '&:hover': {
                                            backgroundColor: Colors.hover,
                                        },
                                        '&:active': {
                                            backgroundColor: Colors.hover,
                                        },
                                    }}
                                    onClick={() =>
                                        rs.prayerJournal.unarchiveItem(
                                            items[id],
                                        )
                                    }
                                >
                                    <Undo />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Archive;
