// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import Listing from './Listing';
import PrayerRecorder from './PrayerRecorder';
import LogOut from 'react-ionicons/lib/MdLogOut';

const useRSKinds = rs => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onKinds(kinds => setState(kinds));
    }, []);
    return state;
};

const useRSItems = rs => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onItems(items => setState(items));
    }, []);
    return state;
};

type Route =
    | { type: 'item', id: string }
    | { type: 'prayer', id: string }
    | { type: 'new-prayer' };

const parsePath = (path: string): ?Route => {
    if (!path.trim()) {
        return null;
    }
    const [type, id] = path.split('/');
    if (type === 'item' && id) {
        return { type: 'item', id };
    }
    if (type === 'prayer') {
        if (id) {
            return { type: 'prayer', id };
        }
        return { type: 'new-prayer' };
    }
};

const serializePath = (route: ?Route): ?string => {
    if (!route) {
        return null;
    }
    switch (route.type) {
        case 'item':
            return `item/${route.id}`;
        case 'prayer':
            return `prayer/${route.id}`;
        case 'new-prayer':
            return 'prayer';
    }
    return null;
};

const HomeScreen = ({ rs }: { rs: any }) => {
    const types = useRSKinds(rs);
    const items = useRSItems(rs);
    const sorted = {};
    Object.keys(items).forEach(id => {
        if (!items[id] || !items[id].active) {
            return;
        }
        const kind = items[id].kind;
        if (!sorted[kind]) {
            sorted[kind] = [];
        }
        sorted[kind].push(items[id]);
    });

    const [route, setRoute] = React.useState((): ?Route => {
        const id = parsePath(window.location.hash.slice(1));
        if (!id) return null;
        return id;
    });

    React.useMemo(() => {
        const str = serializePath(route);
        if (str) {
            window.location.hash = '#' + str;
        } else {
            window.location.hash = '';
        }
    }, [route]);

    const [adding, setAdding] = React.useState(null);

    const [menu, setMenu] = React.useState(false);

    if (route && route.type === 'new-prayer') {
        return (
            <PrayerRecorder
                types={types}
                sorted={sorted}
                initial={() => rs.prayerJournal.getTmpRecord()}
                onClose={() => {
                    setRoute(null);
                }}
                onSave={record => {
                    rs.prayerJournal.putTmpRecord(record);
                }}
                onFinish={record => {
                    rs.prayerJournal.finishRecord(record);
                    setRoute(null);
                }}
            />
        );
    }

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
                        // rs.prayerJournal.addKind
                        // const types = user.get('types');
                        defaultTypes.forEach(t => {
                            rs.prayerJournal.addKind(t);
                        });
                    }}
                >
                    Add default item types
                </button>
            </div>
        );
    }

    if (route && route.type === 'item' && items[route.id]) {
        const item = items[route.id];
        return (
            <ViewItem
                item={item}
                type={types[item.kind]}
                onClose={() => setRoute(null)}
                onDelete={() => {
                    rs.prayerJournal.removeItem(item.id);
                    // deleteItem(item);
                    setRoute(null);
                }}
                onChange={item => {
                    rs.prayerJournal.putItem(item);
                }}
            />
        );
    }

    return (
        <div
            css={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Header rs={rs} onMenu={() => setMenu(true)} />
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
                                activityHistory: [],
                                comments: [],
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
                            await rs.prayerJournal.putItem(data);
                        } catch (e) {
                            return console.error('validation error:', e);
                        }
                        setAdding(null);
                        console.log('stored bookmark successfully');
                    }}
                    onChange={a => setAdding(a)}
                />
            ) : null}
            {menu ? <Menu rs={rs} onClose={() => setMenu(false)} /> : null}
        </div>
    );
};

const Menu = ({ rs, onClose }) => {
    const items = [
        {
            title: (
                <div>
                    {rs.remote.userAddress}
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
            action: () => rs.disconnect(),
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
