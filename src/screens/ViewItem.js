// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import TextareaAutosize from 'react-textarea-autosize';
import Close from 'react-ionicons/lib/MdClose';

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
    onDelete
}: {
    item: Item,
    type: ?Kind,
    onClose: () => void,
    onDelete: () => void,
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
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {maybeBlank(type ? type.title : '')}
                <button onClick={() => onClose()}>
                    <Close />
                </button>
            </div>
            <div>
                <div
                    css={{
                        padding: '8px 16px',
                    }}
                >
                    {maybeBlank(item.text)}
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
