// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import ViewItem, { maybeBlank } from './ViewItem';
import Listing from './Listing';

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

const HomeScreen = ({ rs }: { rs: any }) => {
    const types = useRSKinds(rs);
    const items = useRSItems(rs);
    const sorted = {};
    Object.keys(items).forEach(id => {
        if (!items[id]) {
            return;
        }
        const kind = items[id].kind;
        if (!sorted[kind]) {
            sorted[kind] = [];
        }
        sorted[kind].push(items[id]);
    });

    const [showing, setShowing] = React.useState(() => {
        const id = window.location.hash.slice(1);
        if (!id) return null;
        return id;
    });

    React.useMemo(() => {
        if (showing) {
            window.location.hash = '#' + showing;
        } else {
            window.location.hash = '';
        }
    }, [showing]);

    const [adding, setAdding] = React.useState(null);

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

    if (showing && items[showing]) {
        const item = items[showing];
        return (
            <ViewItem
                item={item}
                type={types[item.kind]}
                onClose={() => setShowing(null)}
                onDelete={() => {
                    rs.prayerJournal.removeItem(item.id);
                    // deleteItem(item);
                    setShowing(null);
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
            <Header rs={rs} />
            <div
                css={{
                    overflow: 'auto',
                    minHeight: 0,
                    flex: 1,
                }}
            >
                <Listing
                    setShowing={setShowing}
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
                    css={{ height: 8, backgroundColor: '#aaf', marginTop: 16 }}
                />
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
        </div>
    );
};

export default HomeScreen;
