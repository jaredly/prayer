// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const Textarea = ({
    minRows,
    maxRows,
    value,
    onChange,
    className,
    placeholder,
    autofocus,
    containerStyle,
}: {
    minRows: number,
    maxRows: number,
    value: string,
    onChange: string => void,
    autofocus?: boolean,
    placeholder: string,
    className?: string,
    containerStyle?: mixed,
}) => {
    const firstMount = React.useRef(true);
    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                // flex: 1,
                flexDirection: 'column',
                ...containerStyle,
            }}
        >
            <TextareaAutosize
                inputRef={
                    autofocus
                        ? r => {
                              if (r && firstMount && firstMount.current) {
                                  firstMount.current = false;
                                  r.focus();
                                  r.selectionStart = r.selectionEnd =
                                      r.value.length;
                              }
                          }
                        : undefined
                }
                minRows={minRows}
                maxRows={maxRows}
                value={value}
                className={className}
                onChange={evt => onChange(evt.target.value)}
            />
            {value === '' ? (
                <div
                    className={className}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        // padding: 8,
                        // fontSize: '24px',
                        // lineHeight: 1.5,
                        opacity: 0.5,
                    }}
                >
                    {placeholder}
                </div>
            ) : (
                ''
            )}
        </div>
    );
};

export default Textarea;
