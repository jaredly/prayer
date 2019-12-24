// @flow
import React from 'react'

type Kind = {
    title: string,
    description: string,
    color?: string,
    icon: string,
};

type Item = {
    kind: string, // id
    text: string,
    active: boolean,
    createdDate: number,
    activityHistory: Array<{active: boolean, date: number}>,
    comments: Array<{
        text: string,
        date: number,
        inReplyTo: string,
    }>
}

const defaultTypes: Array<Kind> = [{
    title: 'People in need',
    description: "People that I know who need help",
    icon: 'P',
}, {
    title: 'Questions I have',
    description: "Probably mostly doctrinal",
    icon: '?'
}, {
    title: 'Requests for guidence',
    description: "Lead kindly light",
    icon: 'G'
}, {
    title: 'General requests',
    description: "Misc needs, wants, etc.",
    icon: 'R'
}, {
    title: 'Gratitude',
    description: "Things I'm grateful for today",
    icon: 'T'
}, {
    title: "God's hand in my life",
    description: 'and ways he is working through me and others',
    icon: 'H',
}, {
    title: 'Processing my experiences',
    description: 'and reports on events, or plans for the future.',
    icon: 'E'
}];

const useGunCollection = (collection) => {
    const [state, setState] = React.useState({});
    React.useMemo(() => {
        collection.map().on((item, id) => {
            setState(current => {
                const next = {...current}
                if (!item) {
                    delete next[id]
                } else {
                    next[id] = item
                }
                return next
            });
        })
    }, [collection])
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

const HomeScreen = ({user}: {user: any}) => {
    const types = useGunCollection(user.get('types'));
    const items = useGunCollection(user.get('items'));
    const sorted = {}
    // Object.keys(items).forEach(id => {
    //     const kind = items[id].kind
    // })
    console.log(items)

    const [adding, setAdding] = React.useState(null)

    if (Object.keys(types).length === 0) {
        return <div>
            <div style={{display: 'flex'}}>
                {defaultTypes.map((t, i) => <div key={i}>{t.title}</div>)}
            </div>
            <button onClick={() => {
                const types = user.get('types');
                defaultTypes.forEach(t => {
                    types.set(t)
                })
            }}>
                Add default item types
            </button>
        </div>
    }

    return <div>
        Hi folks
        {Object.keys(types).map(id => (
            <div key={id}>
                {types[id].title}
                <button onClick={() => setAdding({kind: types[id], text: '', active: true, createdDate: Date.now(), activityHistory: {}, comments: {}})}>
                    Add item
                </button>
            </div>
        ))}
        {adding
        ? <Adder data={adding} onSave={data => {
            setAdding(null);
            user.get('items').set(data);
        }} onChange={a => setAdding(a)} />
    : null}
    </div>
};

export default HomeScreen