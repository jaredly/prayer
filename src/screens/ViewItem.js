// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import TextareaAutosize from 'react-textarea-autosize';
import Close from 'react-ionicons/lib/MdClose';
import Checkmark from 'react-ionicons/lib/MdCheckmark';
import Create from 'react-ionicons/lib/MdCreate';

export const maybeBlank = (text: string) => {
    if (!text.trim()) {
        return <span css={{ opacity: 0.5, fontStyle: 'italic' }}>Blank</span>;
    }
    return text;
};

const MaybeDelete = ({onDelete}: {onDelete: () => void}) => {
    const [really, setReally] = React.useState(false)
    if (really) {
        return <div>
            <button onClick={() => onDelete()}>Really delete</button>
            <button onClick={() => setReally(false)}>Just kidding</button>
        </div>
    }
    return <button onClick={() => setReally(true)}>Delete</button>
}

const ViewItem = ({
    item,
    type,
    onClose,
    onDelete,
    onChange,
}: {
    item: Item,
    type: ?Kind,
    onClose: () => void,
    onDelete: () => void,
    onChange: (item: Item) => void,
}) => {
    const [editing, setEditing] = React.useState(null);

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
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {maybeBlank(type ? type.title : '')}
                <button onClick={() => onClose()} css={{padding: 0, margin: 0}}>
                    <Close />
                </button>
            </div>
            <div>
                <div css={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginRight: 8,
                }}>
                    {editing ?
                        <TextareaAutosize
                            inputRef={r => r ? r.focus() : null}
                            minRows={1}
                            maxRows={15}
                            value={editing.text}
                            css={{
                                flex: 1,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                border: 'none',
                                // lineHeight: 1.5,
                                padding: '8px 16px',
                            }}
                            onChange={evt =>
                                setEditing({ ...editing, text: evt.target.value })
                            }
                        />
                    : <div
                        css={{
                            padding: '8px 16px',
                        }}
                    >
                        {maybeBlank(item.text)}
                    </div>}
                    <button onClick={() => {
                        if (editing) {
                            onChange(editing)
                            setEditing(null)
                        } else {
                            setEditing(item)
                        }
                    }} css={{padding: 0, margin: 0}}>
                    {editing
                        ? <Checkmark />
                        : <Create />}

                    </button>
                </div>
                <div
                    css={{
                        fontSize: '80%',
                        marginTop: 12,
                        padding: '8px 16px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {new Date(item.createdDate).toDateString()}
                    <MaybeDelete onDelete={onDelete}/>
                </div>
            </div>
        </div>
    );
};
export default ViewItem;
