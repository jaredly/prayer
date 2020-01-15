// @flow
/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import LogOut from 'react-ionicons/lib/MdLogOut';
import Menu from 'react-ionicons/lib/MdMenu';
import Colors from './Colors';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';

const Header = ({
    api,
    onMenu,
}: {
    api: PrayerJournalApi,
    onMenu: () => void,
}) => {
    if (!api.isConnected()) {
        return null;
    }
    return (
        <div
            css={{
                padding: '16px',
                backgroundColor: Colors.accent,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <div onClick={() => onMenu()}>
                <Menu />
            </div>
            <div
                css={{
                    textAlign: 'center',
                    flex: 1,
                    fontWeight: 'bold',
                    fontSize: 20,
                }}
            >
                Fervent Prayer
            </div>
        </div>
    );
};

export default Header;
