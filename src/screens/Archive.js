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

const Archive = ({
    types,
    items,
    setRoute,
    rs,
}: {
    types: Types,
    items: Items,
    setRoute: Route => void,
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
                    backgroundColor: Colors.accent,
                    padding: 16,
                }}
            >
                Archived items
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
                            (items[a].modifiedDate || items[a].createdDate) -
                            (items[a].modifiedDate || items[a].createdDate),
                    )
                    .map(id => (
                        <div
                            css={{
                                padding: '8px 16px',
                                '&:hover': {
                                    backgroundColor: Colors.hover,
                                },
                                '&:active': {
                                    backgroundColor: Colors.hover,
                                },
                            }}
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
                                        padding: '8px 16px',
                                    }}
                                >
                                    {maybeBlank(items[id].text)}
                                </div>
                                <button
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
