// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder'
import ViewItem, {maybeBlank} from './ViewItem'

const useRSKinds = rs => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onKinds(kinds => setState(kinds));
    }, []);
    return state;
};

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const useRSItems = rs => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onItems(items => setState(items));
    }, []);
    return state;
};

const HomeScreen = ({ rs, }: { rs: any }) => {
    const types = useRSKinds(rs);
    const items = useRSItems(rs);
    const sorted = {};
    Object.keys(items).forEach(id => {
        const kind = items[id].kind;
        if (!sorted[kind]) {
            sorted[kind] = [];
        }
        sorted[kind].push(items[id]);
    });

    const [showing, setShowing] = React.useState(() => {
        const id = window.location.hash.slice(1)
        if (!id) return null
        return id
    });

    React.useMemo(() => {
        if (showing) {
            window.location.hash = '#' + showing
        } else {
            window.location.hash = ''
        }
    }, [showing])

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
        const item = items[showing]
        return <ViewItem
            item={item}
            type={types[item.kind]}
            onClose={() => setShowing(null)}
            onDelete={() => {
                rs.prayerJournal.removeItem(item.id);
                // deleteItem(item);
                setShowing(null);
            }}
        />
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
                    backgroundColor: '#eee',
                }}
            >
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
                                    onClick={() =>
                                        setAdding({
                                            id: Math.random()
                                                .toString(16)
                                                .slice(2),
                                            kind: id,
                                            text: '',
                                            active: true,
                                            createdDate: Date.now(),
                                            activityHistory: [],
                                            comments: [],
                                        })
                                    }
                                    css={{
                                        // alignSelf: 'stretch',
                                        // width: '100%',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        textAlign: 'left',
                                        fontSize: 'inherit',
                                        padding: '4px 8px',
                                        '&:hover': {
                                            backgroundColor: '#ccc',
                                        },
                                        '&:active': {
                                            backgroundColor: '#ccc',
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
                                                backgroundColor: '#ccc',
                                            },
                                            '&:active': {
                                                backgroundColor: '#ccc',
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
                            await rs.prayerJournal.addItem(data);
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
