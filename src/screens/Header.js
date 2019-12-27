// @flow
/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import LogOut from 'react-ionicons/lib/MdLogOut';
import Colors from './Colors';

const Header = ({ rs }: { rs: any }) => {
    if (!rs.remote.userAddress) {
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
            {rs.remote.userAddress}
            <div
                onClick={() => {
                    rs.disconnect();
                }}
            >
                <LogOut />
            </div>
        </div>
    );
};

export default Header;
