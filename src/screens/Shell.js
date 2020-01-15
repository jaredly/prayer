// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../types';
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
import type { PrayerJournalApi } from '../db/PrayerJournalApi';

const useRSKinds = (api: PrayerJournalApi) => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return api.onKinds(kinds => setState(kinds));
    }, []);
    return state;
};

const useRSItems = api => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return api.onItems(items => setState(items));
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

const Shell = ({ api }: { api: PrayerJournalApi }) => {
    const types = useRSKinds(api);
    const items = useRSItems(api);
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
            <Home setRoute={setRoute} types={types} sorted={sorted} api={api} />
        );
    }

    if (route.type === 'new-prayer') {
        return (
            <PrayerRecorder
                types={types}
                sorted={sorted}
                initial={() => api.getTmpRecord()}
                onDiscard={() => {
                    api.discardTmpRecord();
                    setRoute(null);
                }}
                archiveItem={item => {
                    api.archiveItem(item);
                }}
                onClose={() => {
                    setRoute(null);
                }}
                onSave={record => {
                    api.putTmpRecord(record);
                }}
                onFinish={record => {
                    api.finishRecord(record);
                    setRoute(null);
                }}
            />
        );
    }

    if (route.type === 'records') {
        return (
            <Records
                setRoute={setRoute}
                types={types}
                items={items}
                api={api}
            />
        );
    }

    if (route.type === 'item' && items[route.id]) {
        const item = items[route.id];
        return (
            <ViewItem
                item={item}
                api={api}
                type={types[item.kind]}
                onClose={() => setRoute(null)}
                onDelete={() => {
                    api.removeItem(item.id);
                    // deleteItem(item);
                    setRoute(null);
                }}
                onChange={item => {
                    api.putItem(item);
                }}
            />
        );
    }

    if (route.type === 'archive') {
        return (
            <Archive
                setRoute={setRoute}
                types={types}
                items={items}
                api={api}
            />
        );
    }

    if (route.type === 'categories') {
        return (
            <Categories
                setRoute={setRoute}
                types={types}
                items={items}
                api={api}
            />
        );
    }

    // umm unhandled route I guess
    return <Home setRoute={setRoute} types={types} sorted={sorted} api={api} />;
};

export default Shell;
