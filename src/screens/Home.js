// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import {defaultTypes, type Item} from '../prayerJournalModule'

const useRSKinds = (rs) => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onKinds(kinds => setState(kinds))
    }, [])
    return state
}

const useRSItems = (rs) => {
    const [state, setState] = React.useState({});
    React.useEffect(() => {
        return rs.prayerJournal.onItems(items => setState(items))
    }, [])
    return state
}

const Adder = ({data, onChange, onSave}) => {
    return <div>
        <input value={data.text} onChange={evt => onChange({...data, text: evt.target.value})} />
        <button onClick={() => onSave(data)}>
            Save
        </button>
    </div>
}

const HomeScreen = ({rs}: {rs: any}) => {
    const types = useRSKinds(rs);
    const items = useRSItems(rs);
    const sorted = {}
    Object.keys(items).forEach(id => {
        const kind = items[id].kind
        if (!sorted[kind]) {
            sorted[kind] = []
        }
        sorted[kind].push(items[id])
    });

    const [adding, setAdding] = React.useState(null)

    if (Object.keys(types).length === 0) {
        return <div>
            <div style={{display: 'flex'}}>
                {defaultTypes.map((t, i) => <div key={i}>{t.title}</div>)}
            </div>
            <button onClick={() => {
                // rs.prayerJournal.addKind
                // const types = user.get('types');
                defaultTypes.forEach(t => {
                    rs.prayerJournal.addKind(t)
                })
            }}>
                Add default item types
            </button>
        </div>
    }

    return <div css={{
        // backgroundColor: '#aaf',
    }}>
        {Object.keys(types).map(id => (
            <div key={id} css={{
                // padding: '8px 16px',
            }}>
                <div css={{
                    fontSize: '80%',
                }}>
                {types[id].title}
                </div>
                <div>
                    {(sorted[id] || []).map(item => (
                        <div key={item.id}>
                            {item.text}
                        </div>
                    ))}
                    <button onClick={() => setAdding({
                        id: Math.random().toString(16).slice(2),
                        kind: id,
                        text: '',
                        active: true,
                        createdDate: Date.now(),
                        activityHistory: [],
                        comments: []
                    })} css={{
                        alignSelf: 'stretch',
                        border: 'none',
                        backgroundColor: 'transparent',
                        '&:hover': {
                            backgroundColor: '#ccc',
                        },
                        '&:active': {
                            backgroundColor: '#ccc',
                        }
                    }}>
                        ➕
                    </button>
                </div>
            </div>
        ))}
        {adding
        ? <Adder data={adding} onSave={async (data: Item) => {
            setAdding(null);
            // user.get('items').set(data);

            try {
                await rs.prayerJournal.addItem(data)
            } catch(e) {
                return console.error('validation error:', e);
            }
            setAdding(null);
            console.log('stored bookmark successfully');
        }} onChange={a => setAdding(a)} />
    : null}
    </div>
};

export default HomeScreen