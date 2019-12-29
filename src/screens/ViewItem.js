// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import Textarea from './Textarea';
import Close from 'react-ionicons/lib/MdClose';
import Checkmark from 'react-ionicons/lib/MdCheckmark';
import Create from 'react-ionicons/lib/MdCreate';
import { useRecords } from './Records';
import type { RemoteStorageT } from '../';
import Colors from './Colors';

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
    rs,
}: {
    item: Item,
    type: ?Kind,
    onClose: () => void,
    onDelete: () => void,
    onChange: (item: Item) => void,
    rs: RemoteStorageT,
}) => {
    const records = useRecords(rs);
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
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {maybeBlank(type ? type.title : '')}
                <button
                    onClick={() => onClose()}
                    css={{ padding: 8, margin: 0 }}
                >
                    <Close />
                </button>
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
                    Created {new Date(item.createdDate).toDateString()}
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
                    .sort(
                        (a, b) =>
                            records[b].createdDate - records[a].createdDate,
                    )
                    .map(id => (
                        <div
                            key={id}
                            css={{ paddingLeft: 16, marginBottom: 16 }}
                        >
                            <div
                                css={{
                                    fontSize: '80%',
                                    color: Colors.grayText,
                                    marginBottom: 8,
                                }}
                            >
                                {new Date(
                                    records[id].createdDate,
                                ).toLocaleString()}
                            </div>
                            {records[id].notes[item.id]}
                        </div>
                    ))}
            </div>
        </div>
    );
};
export default ViewItem;
