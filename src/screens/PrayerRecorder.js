// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import {
    defaultTypes,
    type Record,
    type Item,
    type Kind,
} from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import Colors from './Colors';
import { cmp } from './Listing';
import Circle from 'react-ionicons/lib/MdRadioButtonOff';
import Check from 'react-ionicons/lib/MdCheckmarkCircleOutline';
import Textarea from './Textarea';

const debounced = (minWait, maxWait, fn) => {
    let args;
    let tid = null;
    let last = Date.now();
    return function() {
        args = arguments;
        clearTimeout(tid);
        if (Date.now() - last > maxWait) {
            last = Date.now();
            fn.apply(null, args);
        } else {
            tid = setTimeout(() => {
                last = Date.now();
                fn.apply(null, args);
            }, minWait);
        }
    };
};

const PrayerRecorder = ({
    types,
    sorted,
    onClose,
    onSave,
    onFinish,
    initial,
}: {
    types: { [key: string]: Kind },
    sorted: { [key: string]: Array<Item> },
    onClose: () => void,
    onSave: Record => void,
    onFinish: Record => void,
    initial: () => Promise<Record>,
}) => {
    const [prayer, updatePrayer] = React.useState(null);

    React.useMemo(() => {
        initial().then(record => {
            updatePrayer(record);
        });
    }, []);

    const save: Record => void = React.useMemo(() =>
        debounced(200, 2000, onSave),
    );

    React.useEffect(() => {
        if (prayer) {
            save(prayer);
        }
    }, [prayer]);

    const [expanded, setExpanded] = React.useState({});

    if (!prayer) {
        return 'Loading...';
    }

    return (
        <div
            css={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {Object.keys(sorted)
                .sort((a, b) => cmp(types[a].title, types[b].title))
                .map(kind =>
                    sorted[kind].length ? (
                        <div key={kind}>
                            <div
                                css={{
                                    fontWeight: 'bold',
                                    padding: 8,
                                    color: Colors.accentText,
                                }}
                            >
                                {types[kind].title}
                            </div>
                            {sorted[kind].map(item => (
                                <PrayerItem
                                    item={item}
                                    note={prayer.notes[item.id]}
                                    onChange={text =>
                                        updatePrayer({
                                            ...prayer,
                                            notes: {
                                                ...prayer.notes,
                                                [item.id]: text,
                                            },
                                        })
                                    }
                                />
                            ))}
                        </div>
                    ) : null,
                )}
            <div
                css={{
                    fontWeight: 'bold',
                    padding: 8,
                    color: Colors.accentText,
                }}
            >
                General thoughts
            </div>
            <Textarea
                placeholder="General thoughts"
                minRows={3}
                maxRows={15}
                value={prayer.generalNotes}
                css={{
                    fontFamily: 'inherit',
                    fontSize: '24px',
                    lineHeight: 1.5,
                    padding: 8,
                }}
                onChange={generalNotes =>
                    updatePrayer({ ...prayer, generalNotes })
                }
            />
        </div>
    );
};

const PrayerItem = ({
    item,
    onChange,
    note,
}: {
    item: Item,
    onChange: string => void,
    note: string,
}) => {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
        <div>
            <div
                css={{
                    fontSize: 24,
                    padding: 4,
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                {note ? <Check /> : <Circle />}
                <span style={{ width: 8, display: 'inline-block' }} />
                {item.text}
            </div>
            {collapsed ? null : (
                <Textarea
                    value={note || ''}
                    autofocus
                    onChange={onChange}
                    placeholder="Enter some thoughts"
                    minRows={1}
                    maxRows={15}
                    css={{
                        fontFamily: 'inherit',
                        fontSize: '20px',
                        lineHeight: 1.5,
                        padding: 8,
                    }}
                />
            )}
        </div>
    );
};

export default PrayerRecorder;
