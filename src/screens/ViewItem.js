// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../types';
import Header from './Header';
import Adder from './Adder';
import Textarea from './Textarea';
import Close from 'react-ionicons/lib/MdClose';
import Checkmark from 'react-ionicons/lib/MdCheckmark';
import Create from 'react-ionicons/lib/MdCreate';
import { useRecords } from './Records';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';
import Colors from './Colors';
import ArrowBack from 'react-ionicons/lib/MdArrowBack';

export const maybeBlank = (text: string) => {
    if (!text.trim()) {
        return <span css={{ opacity: 0.5, fontStyle: 'italic' }}>Blank</span>;
    }
    return text;
};

const MaybeDelete = ({ onDelete }: { onDelete: () => void }) => {
    const [really, setReally] = React.useState(false);
    if (really) {
        return (
            <div css={{ display: 'flex', flexDirection: 'row' }}>
                <button onClick={() => onDelete()} css={{ color: 'red' }}>
                    Really delete
                </button>
                <button onClick={() => setReally(false)}>Just kidding</button>
            </div>
        );
    }
    return <button onClick={() => setReally(true)}>Delete</button>;
};

const Text = ({ onChange, item }) => {
    const [editing, setEditing] = React.useState(null);
    return (
        <div
            css={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginRight: 8,
            }}
        >
            {editing ? (
                <Textarea
                    placeholder="Enter item text"
                    // inputRef={r => (r ? r.focus() : null)}
                    autofocus
                    minRows={1}
                    maxRows={15}
                    value={editing.text}
                    containerStyle={{ flex: 1 }}
                    css={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        border: 'none',
                        // lineHeight: 1.5,
                        padding: '8px 16px',
                    }}
                    onChange={text => setEditing({ ...editing, text })}
                />
            ) : (
                <div
                    css={{
                        padding: '8px 16px',
                    }}
                >
                    {maybeBlank(item.text)}
                </div>
            )}
            <button
                onClick={() => {
                    if (editing) {
                        onChange(editing);
                        setEditing(null);
                    } else {
                        setEditing(item);
                    }
                }}
                css={{ padding: 0, margin: 0 }}
            >
                {editing ? <Checkmark /> : <Create />}
            </button>
        </div>
    );
};

const ViewItem = ({
    item,
    type,
    onClose,
    onDelete,
    onChange,
    api,
}: {
    item: Item,
    type: ?Kind,
    onClose: () => void,
    onDelete: () => void,
    onChange: (item: Item) => void,
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
                <div onClick={() => onClose()} css={{ padding: 16 }}>
                    <ArrowBack />
                </div>
                <div
                    css={{
                        padding: 16,
                    }}
                >
                    Edit item
                </div>
            </div>
            <div
                css={{
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {maybeBlank(type ? type.title : '')}
            </div>
            <div>
                <Text onChange={onChange} item={item} />
                <div
                    css={{
                        fontSize: '80%',
                        marginTop: 12,
                        padding: '8px 16px',
                        marginBottom: 16,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span css={{ color: Colors.grayText }}>
                        Created {new Date(item.createdDate).toDateString()}
                    </span>

                    {item.active ? (
                        <button
                            onClick={() => {
                                api.archiveItem(item);
                                onClose();
                            }}
                        >
                            Archive
                        </button>
                    ) : (
                        <button onClick={() => api.unarchiveItem(item)}>
                            Unarchive
                        </button>
                    )}
                    <MaybeDelete onDelete={onDelete} />
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
                    .filter(k => !!records[k].notes[item.id])
                    .map(id => ({ type: 'record', id }))
                    .concat(
                        item.thoughts
                            ? item.thoughts.map(thought => ({
                                  type: 'thought',
                                  thought,
                              }))
                            : [],
                    )
                    .sort(
                        (a, b) =>
                            (b.type === 'record'
                                ? records[b.id].createdDate
                                : b.thought.date) -
                            (a.type === 'record'
                                ? records[a.id].createdDate
                                : a.thought.date),
                    )
                    .map((entry, i) =>
                        entry.type === 'record' ? (
                            <div
                                key={entry.id}
                                css={{
                                    paddingLeft: 16,
                                    marginBottom: 16,
                                    paddingRight: 16,
                                }}
                            >
                                <div
                                    css={{
                                        fontSize: '80%',
                                        color: Colors.grayText,
                                        marginBottom: 8,
                                    }}
                                >
                                    {new Date(
                                        records[entry.id].createdDate,
                                    ).toLocaleString()}
                                </div>
                                {records[entry.id].notes[item.id]}
                            </div>
                        ) : (
                            <div
                                key={i}
                                css={{
                                    paddingLeft: 16,
                                    marginBottom: 16,
                                    paddingRight: 16,
                                }}
                            >
                                <div
                                    css={{
                                        fontSize: '80%',
                                        color: Colors.grayText,
                                        marginBottom: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {new Date(
                                        entry.thought.date,
                                    ).toLocaleString()}
                                    <span>thought</span>
                                </div>
                                {entry.thought.text}
                            </div>
                        ),
                    )}
            </div>
            <AddThought
                onAdd={text =>
                    onChange({
                        ...item,
                        thoughts: (item.thoughts || []).concat([
                            {
                                text,
                                date: Date.now(),
                            },
                        ]),
                    })
                }
            />
        </div>
    );
};

const AddThought = ({ onAdd }) => {
    const [adding, setAdding] = React.useState(null);
    if (adding == null) {
        return (
            <div css={{ display: 'flex', flexDirection: 'column' }}>
                <button
                    css={{
                        backgroundColor: Colors.accent,
                        fontSize: 20,
                        padding: 8,
                        alignSelf: 'stretch',
                    }}
                    onClick={() => setAdding('')}
                >
                    Add thought
                </button>
            </div>
        );
    }
    return (
        <div css={{ border: `8px solid ${Colors.accent}` }}>
            <Textarea
                placeholder="Enter text"
                minRows={3}
                maxRows={10}
                value={adding}
                css={{
                    fontSize: 20,
                    padding: 8,
                }}
                onChange={setAdding}
            />
            <div css={{ display: 'flex' }}>
                <button
                    onClick={() => {
                        onAdd(adding);
                        setAdding(null);
                    }}
                    css={{ fontSize: 20, flex: 1, padding: 8 }}
                >
                    Add thought
                </button>
                <button
                    onClick={() => setAdding(null)}
                    css={{ fontSize: 20, color: 'red', flex: 1, padding: 8 }}
                >
                    Discard
                </button>
            </div>
        </div>
    );
};

export default ViewItem;
