// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultTypes, type Item, type Kind } from '../types';
import ViewItem, { maybeBlank } from './ViewItem';
import Colors from './Colors';
import type { PrayerJournalApi } from '../db/PrayerJournalApi';
import type { Route, Items, Types } from './Shell';
import Undo from 'react-ionicons/lib/MdUndo';
import ArrowBack from 'react-ionicons/lib/MdArrowBack';
import { cmp } from './Listing';
import Textarea from './Textarea';
import Close from 'react-ionicons/lib/MdClose';
import Checkmark from 'react-ionicons/lib/MdCheckmark';

const Categories = ({
    types,
    items,
    setRoute,
    api,
}: {
    types: Types,
    items: Items,
    setRoute: (?Route) => void,
    api: PrayerJournalApi,
}) => {
    const [editing, setEditing] = React.useState(null);
    return (
        <div
            css={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                css={{
                    display: 'flex',
                    backgroundColor: Colors.accent,
                    alignItems: 'center',
                }}
            >
                <div onClick={() => setRoute(null)} css={{ padding: 16 }}>
                    <ArrowBack />
                </div>
                <div
                    css={{
                        padding: 16,
                    }}
                >
                    Categories
                </div>
            </div>
            <div
                css={{
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                }}
            >
                {Object.keys(types)
                    .sort((a, b) => cmp(types[a].title, types[b].title))
                    .map(id => (
                        <div
                            css={{
                                padding: 8,
                            }}
                            onClick={() => setEditing(types[id])}
                        >
                            <div css={{ fontSize: 20, marginBottom: 8 }}>
                                {types[id].title}
                            </div>
                            <div>{types[id].description}</div>
                        </div>
                    ))}
                <button
                    onClick={() => setEditing(blankKind)}
                    css={{
                        padding: 8,
                        width: '100%',
                        border: 'none',
                        fontSize: 'inherit',
                        marginTop: 16,
                    }}
                >
                    Add new category
                </button>
            </div>
            {editing ? (
                <Editor
                    key={editing.id}
                    initial={editing}
                    onCancel={() => setEditing(null)}
                    onSave={kind => {
                        const ready =
                            kind.id === ''
                                ? {
                                      ...kind,
                                      id: Math.random()
                                          .toString(16)
                                          .slice(2),
                                  }
                                : kind;
                        setEditing(null);
                        return api.putKind(ready).then(_ => undefined);
                    }}
                />
            ) : null}
        </div>
    );
};

const isValid = kind => kind.title !== '' && kind.description !== '';

const blankKind: Kind = {
    id: '',
    title: '',
    description: '',
    icon: '',
};

const Editor = ({
    initial,
    onSave,
    onCancel,
}: {
    initial: Kind,
    onSave: Kind => Promise<void>,
    onCancel: () => void,
}) => {
    const [tmp, updateTmp] = React.useState(initial);

    return (
        <div css={{ display: 'flex', flexDirection: 'column' }}>
            <div
                css={{
                    fontSize: '24px',
                    // fontWeight: 'bold',
                    padding: 8,
                    // borderTop: `8px ${Colors.accent} solid`,
                    backgroundColor: Colors.accent,
                }}
            >
                {initial.id === '' ? 'Add category' : 'Edit category'}
            </div>
            <div
                css={{
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <div
                    css={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                    <Textarea
                        minRows={1}
                        maxRows={5}
                        value={tmp.title}
                        autofocus
                        css={{
                            fontFamily: 'inherit',
                            fontSize: '20px',
                            lineHeight: 1.5,
                            padding: 8,
                        }}
                        onChange={title => updateTmp({ ...tmp, title })}
                        placeholder="Title"
                        containerStyle={{ flex: 1 }}
                    />
                    <Textarea
                        minRows={3}
                        maxRows={10}
                        value={tmp.description}
                        css={{
                            fontFamily: 'inherit',
                            fontSize: '20px',
                            lineHeight: 1.5,
                            padding: 8,
                        }}
                        onChange={description =>
                            updateTmp({ ...tmp, description })
                        }
                        placeholder="Description"
                        containerStyle={{ flex: 1 }}
                    />
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
                    {isValid(tmp) ? (
                        <button onClick={() => onSave(tmp)}>
                            <Checkmark />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Categories;
