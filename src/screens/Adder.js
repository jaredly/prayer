// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import TextareaAutosize from 'react-textarea-autosize';
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
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                    }}
                >
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
                        onChange={evt =>
                            onChange({ ...data, text: evt.target.value })
                        }
                    />
                    {data.text === '' ? (
                        <div
                            css={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none',
                                padding: 8,
                                fontSize: '24px',
                                lineHeight: 1.5,
                                opacity: 0.5,
                            }}
                        >
                            Enter text here...
                        </div>
                    ) : null}
                </div>
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
