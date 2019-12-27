// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import Textarea from './Textarea';
import Colors from './Colors';
import Close from 'react-ionicons/lib/MdClose';
import Checkmark from 'react-ionicons/lib/MdCheckmark';

const Adder = ({
    type,
    data,
    onChange,
    onSave,
    onCancel,
}: {
    type: string,
    data: Item,
    onChange: Item => void,
    onSave: Item => Promise<void>,
    onCancel: () => void,
}) => {
    return (
        <div css={{ display: 'flex', flexDirection: 'column' }}>
            <div
                css={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    padding: 8,
                    borderTop: `8px ${Colors.accent} solid`,
                }}
            >
                {type}
            </div>
            <div
                css={{
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <Textarea
                    minRows={3}
                    maxRows={15}
                    value={data.text}
                    autofocus
                    css={{
                        fontFamily: 'inherit',
                        fontSize: '24px',
                        lineHeight: 1.5,
                        padding: 8,
                    }}
                    onChange={text => onChange({ ...data, text })}
                    placeholder="Enter text here..."
                    containerStyle={{ flex: 1 }}
                />
                <div
                    css={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                    }}
                >
                    <button onClick={() => onCancel()}>
                        <Close />
                    </button>
                    {data.text !== '' ? (
                        <button onClick={() => onSave(data)}>
                            <Checkmark />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Adder;
