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
import TestingHeader from './TestingHeader';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';
import type { Types, Sorted, Route } from './Shell';

const HomeScreen = ({
    api,
    types,
    sorted,
    setRoute,
}: {
    api: PrayerJournalApi,
    types: Types,
    sorted: Sorted,
    setRoute: Route => void,
}) => {
    const [adding, setAdding] = React.useState(null);

    const [menu, setMenu] = React.useState(false);

    return (
        <div
            css={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <TestingHeader api={api} />
            <Header api={api} onMenu={() => setMenu(true)} />
            <div
                css={{
                    position: 'relative',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                }}
            >
                <div
                    css={{
                        overflow: 'auto',
                        minHeight: 0,
                    }}
                >
                    <Listing
                        api={api}
                        setShowing={id => setRoute({ type: 'item', id })}
                        sorted={sorted}
                        types={types}
                        onAdd={kind =>
                            setAdding({
                                id: Math.random()
                                    .toString(16)
                                    .slice(2),
                                kind,
                                text: '',
                                active: true,
                                createdDate: Date.now(),
                                modifiedDate: Date.now(),
                                activityHistory: [],
                                thoughts: [],
                            })
                        }
                    />
                    <div
                        css={{
                            height: 8,
                            backgroundColor: Colors.accent,
                            marginTop: 64,
                        }}
                    />
                </div>
                <div
                    onClick={() => setRoute({ type: 'new-prayer' })}
                    css={{
                        backgroundColor: Colors.accent,
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        fontSize: 24,
                        padding: '16px 24px',
                        borderRadius: 100,
                    }}
                >
                    Record prayer
                </div>
            </div>
            {adding ? (
                <Adder
                    type={types[adding.kind].title}
                    data={adding}
                    onCancel={() => setAdding(null)}
                    onSave={async (data: Item) => {
                        try {
                            await api.putItem(data);
                        } catch (e) {
                            return console.error('validation error:', e);
                        }
                        setAdding(null);
                        console.log('stored bookmark successfully');
                    }}
                    onChange={a => setAdding(a)}
                />
            ) : null}
            {menu ? (
                <Menu
                    api={api}
                    onClose={() => setMenu(false)}
                    setRoute={setRoute}
                />
            ) : null}
        </div>
    );
};

const Menu = ({ api, onClose, setRoute }) => {
    const items = [
        {
            title: 'Records',
            action: () => setRoute({ type: 'records' }),
        },
        {
            title: 'Archived items',
            action: () => setRoute({ type: 'archive' }),
        },
        {
            title: 'Categories',
            action: () => setRoute({ type: 'categories' }),
        },
        {
            title: (
                <div>
                    {api.getUsername()}
                    <div
                        css={{
                            marginTop: 16,
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                        }}
                    >
                        <LogOut style={{ marginRight: 16 }} /> Logout
                    </div>
                </div>
            ),
            action: () => api.logout(),
        },
    ];
    return (
        <div
            css={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
            onMouseDown={evt => onClose()}
        >
            <div
                css={{
                    width: 200,
                    backgroundColor: Colors.accent,
                    height: '100vh',
                }}
                onMouseDown={evt => evt.stopPropagation()}
            >
                <div css={{ padding: 16, fontWeight: 'bold' }}>
                    Fervent Prayer
                </div>
                {items.map((item, i) => (
                    <div
                        key={i}
                        css={{
                            padding: 16,
                        }}
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;
