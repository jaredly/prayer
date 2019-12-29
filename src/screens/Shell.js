// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../prayerJournalModule';
import Header from './Header';
import Adder from './Adder';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import Listing from './Listing';
import PrayerRecorder from './PrayerRecorder';
import Home from './Home';
import Archive from './Archive';
import Records from './Records';
import Categories from './Categories';
import type { RemoteStorageT } from '../';

const useRSKinds = (rs: RemoteStorageT) => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onKinds(kinds => setState(kinds));
    }, []);
    return state;
};

const useRSItems = (rs: RemoteStorageT) => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onItems(items => setState(items));
    }, []);
    return state;
};

export type Types = { [key: string]: Kind };
export type Items = { [key: string]: Item };
export type Sorted = { [key: string]: Array<Item> };

export type Route =
    | { type: 'item', id: string }
    | { type: 'prayer', id: string }
    | { type: 'records' }
    | { type: 'new-prayer' }
    | { type: 'archive' }
    | { type: 'categories' };

const routeEq = (one: ?Route, two: ?Route) => {
    if (!one || !two) {
        return one === two;
    }
    return one.type === two.type;
};

const parsePath = (path: string): ?Route => {
    if (!path.trim()) {
        return null;
    }
    const [type, id] = path.split('/');
    if (type === 'item' && id) {
        return { type: 'item', id };
    }
    if (type === 'prayer') {
        if (id) {
            return { type: 'prayer', id };
        }
        return { type: 'new-prayer' };
    }
    if (type === 'archive') {
        return { type: 'archive' };
    }
    if (type === 'categories') {
        return { type: 'categories' };
    }
    if (type === 'records') {
        return { type: 'records' };
    }
};

const serializePath = (route: ?Route): ?string => {
    if (!route) {
        return null;
    }
    switch (route.type) {
        case 'item':
            return `item/${route.id}`;
        case 'prayer':
            return `prayer/${route.id}`;
        case 'new-prayer':
            return 'prayer';
        case 'categories':
            return 'categories';
        case 'archive':
            return 'archive';
        case 'records':
            return 'records';
    }
    return null;
};

const Shell = ({ rs }: { rs: RemoteStorageT }) => {
    const types = useRSKinds(rs);
    const items = useRSItems(rs);
    const sorted = {};
    Object.keys(items).forEach(id => {
        if (!items[id] || !items[id].active) {
            return;
        }
        const kind = items[id].kind;
        if (!sorted[kind]) {
            sorted[kind] = [];
        }
        sorted[kind].push(items[id]);
    });

    const [route, setRoute] = React.useState((): ?Route => {
        const id = parsePath(window.location.hash.slice(1));
        if (!id) return null;
        return id;
    });

    const routeRef = React.useRef(route);
    React.useMemo(() => {
        routeRef.current = route;
    }, [route]);

    React.useEffect(() => {
        window.addEventListener('hashchange', () => {
            const newRoute = parsePath(window.location.hash.slice(1));
            if (!routeEq(newRoute, routeRef.current)) {
                setRoute(newRoute);
            }
        });
    }, []);

    React.useMemo(() => {
        const str = serializePath(route);
        if (str) {
            window.location.hash = '#' + str;
        } else {
            window.location.hash = '';
        }
    }, [route]);

    if (!route) {
        return (
            <Home setRoute={setRoute} types={types} sorted={sorted} rs={rs} />
        );
    }

    if (route.type === 'new-prayer') {
        return (
            <PrayerRecorder
                types={types}
                sorted={sorted}
                initial={() => rs.prayerJournal.getTmpRecord()}
                onDiscard={() => {
                    rs.prayerJournal.discardTmpRecord();
                    setRoute(null);
                }}
                archiveItem={item => {
                    rs.prayerJournal.archiveItem(item);
                }}
                onClose={() => {
                    setRoute(null);
                }}
                onSave={record => {
                    rs.prayerJournal.putTmpRecord(record);
                }}
                onFinish={record => {
                    rs.prayerJournal.finishRecord(record);
                    setRoute(null);
                }}
            />
        );
    }

    if (route.type === 'records') {
        return (
            <Records setRoute={setRoute} types={types} items={items} rs={rs} />
        );
    }

    if (route.type === 'item' && items[route.id]) {
        const item = items[route.id];
        return (
            <ViewItem
                item={item}
                rs={rs}
                type={types[item.kind]}
                onClose={() => setRoute(null)}
                onDelete={() => {
                    rs.prayerJournal.removeItem(item.id);
                    // deleteItem(item);
                    setRoute(null);
                }}
                onChange={item => {
                    rs.prayerJournal.putItem(item);
                }}
            />
        );
    }

    if (route.type === 'archive') {
        return (
            <Archive setRoute={setRoute} types={types} items={items} rs={rs} />
        );
    }

    if (route.type === 'categories') {
        return (
            <Categories
                setRoute={setRoute}
                types={types}
                items={items}
                rs={rs}
            />
        );
    }

    // umm unhandled route I guess
    return <Home setRoute={setRoute} types={types} sorted={sorted} rs={rs} />;
};

export default Shell;
