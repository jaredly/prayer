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
import Archive from 'react-ionicons/lib/MdArchive';
import Undo from 'react-ionicons/lib/MdUndo';
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

    const save: Record => void = React.useMemo(
        () => debounced(200, 2000, onSave),
        [],
    );

    React.useEffect(() => {
        if (prayer) {
            save(prayer);
        }
    }, [prayer]);

    // const [archived, setArchived] = React.useState({});

    if (!prayer) {
        return 'Loading...';
    }

    return (
        <div
            css={{
                display: 'flex',
                flexDirection: 'column',
                width: '100vw',
                height: '100vh',
            }}
        >
            <div
                css={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    minHeight: 0,
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
                                {sorted[kind].map(item =>
                                    prayer.archiving &&
                                    prayer.archiving[item.id] ? (
                                        <ArchivedPrayerItem
                                            onRestore={() => {
                                                updatePrayer({
                                                    ...prayer,
                                                    archiving: {
                                                        ...prayer.archiving,
                                                        [item.id]: false,
                                                    },
                                                });
                                            }}
                                            item={item}
                                        />
                                    ) : (
                                        <PrayerItem
                                            item={item}
                                            note={prayer.notes[item.id]}
                                            onArchive={() =>
                                                updatePrayer({
                                                    ...prayer,
                                                    archiving: {
                                                        ...prayer.archiving,
                                                        [item.id]: true,
                                                    },
                                                })
                                            }
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
                                    ),
                                )}
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
            <div
                css={{
                    display: 'flex',
                }}
            >
                <button
                    css={{
                        fontSize: 24,
                        flex: 1,
                        padding: '8px 24px',
                        backgroundColor: Colors.accent,
                        border: 'none',
                    }}
                    onClick={() => onFinish(prayer)}
                >
                    Finish
                </button>
                <button
                    css={{
                        fontSize: 24,
                        flex: 1,
                        padding: '8px 24px',
                        backgroundColor: 'white',
                        border: 'none',
                    }}
                    onClick={() => onClose()}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const ArchivedPrayerItem = ({
    item,
    onRestore,
}: {
    item: Item,
    onRestore: () => void,
}) => {
    return (
        <div
            css={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
            }}
        >
            <div css={{ flex: 1, padding: '8px 16px', fontStyle: 'italic' }}>
                {item.text}
            </div>
            <button onClick={() => onRestore()}>
                <Undo />
            </button>
        </div>
    );
};

const PrayerItem = ({
    item,
    onChange,
    onArchive,
    note,
}: {
    item: Item,
    onChange: string => void,
    onArchive: () => void,
    note: string,
}) => {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
        <div>
            <div
                css={{
                    fontSize: 24,
                    padding: 4,
                    borderLeft: '8px solid',
                    borderColor: note ? Colors.accent : 'white',
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                {item.text}
            </div>
            {collapsed ? null : (
                <div
                    css={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                    }}
                >
                    <Textarea
                        value={note || ''}
                        autofocus
                        onChange={onChange}
                        placeholder="Enter some thoughts"
                        minRows={1}
                        maxRows={15}
                        containerStyle={{ flex: 1 }}
                        css={{
                            fontFamily: 'inherit',
                            fontSize: '20px',
                            lineHeight: 1.5,
                            padding: 8,
                        }}
                    />
                    <button onClick={() => onArchive()}>
                        <Archive />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PrayerRecorder;
