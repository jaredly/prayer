// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import Listing from './Listing';
import LogOut from 'react-ionicons/lib/MdLogOut';

const PrayerRecorder = ({ types, sorted }) => {
    const [prayer, updatePrayer] = React.useState(() => ({
        id: Math.random()
            .toString(16)
            .slice(2),
        createdDate: Date.now(),
        notes: {},
        generalNotes: '',
    }));

    const [expanded, setExpanded] = React.useState({});

    return (
        <>
            {Object.keys(sorted).map(kind =>
                sorted[kind].length ? (
                    <div key={kind}>
                        <div>{types[kind].title}</div>
                        {sorted[kind].map(item => (
                            <div>{item.text}</div>
                        ))}
                    </div>
                ) : null,
            )}
        </>
    );
};

export default PrayerRecorder;
