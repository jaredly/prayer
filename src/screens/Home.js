// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import TextareaAutosize from 'react-textarea-autosize';

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

const Adder = ({ type, data, onChange, onSave, onCancel }) => {
    return (
        <div css={{display: 'flex', flexDirection: 'column'}}>
            <div css={{
                fontSize: '24px',
                fontWeight: 'bold',
                padding: 8,
            }}>
            {type}
            </div>
            <div style={{position: 'relative', display: 'flex', flexDirection: 'column'}}>
            <TextareaAutosize
                minRows={3}
                maxRows={15}
                value={data.text}
                css={{
                    fontFamily: 'inherit',
                    fontSize: '24px',
                    lineHeight: 1.5,
                    padding: 8,
                }}
                onChange={evt => onChange({ ...data, text: evt.target.value })}
            />
            {data.text === ''
            ? <div css={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                    padding: 8,
                fontSize: '24px',
                lineHeight: 1.5,
                opacity: 0.5,
            }}>Enter text here...</div>
            : null}
            </div>
            {data.text === ''
            ? <button onClick={() => onCancel()}>Cancel</button>
            : <button onClick={() => onSave(data)}>Save</button>}
        </div>
    );
};

const HomeScreen = ({ rs }: { rs: any }) => {
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
            <div css={{ overflow: 'auto', minHeight: 0, flex: 1, backgroundColor: '#eee' }}>
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
                                        css={{
                                            padding: '8px 16px',
                                        }}
                                        key={item.id}
                                    >
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
