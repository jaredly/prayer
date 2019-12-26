// @flow

type Kind = {
    id: string,
    title: string,
    description: string,
    color?: string,
    icon: string,
};

export const defaultTypes: Array<Kind> = [{
    id: 'people',
    title: 'People in need',
    description: "People that I know who need help",
    icon: 'P',
}, {
    id: 'questions',
    title: 'Questions I have',
    description: "Probably mostly doctrinal",
    icon: '?'
}, {
    id: 'guidence',
    title: 'Requests for guidence',
    description: "Lead kindly light",
    icon: 'G'
}, {
    id: 'requests',
    title: 'General requests',
    description: "Misc needs, wants, etc.",
    icon: 'R'
}, {
    id: 'gratitude',
    title: 'Gratitude',
    description: "Things I'm grateful for today",
    icon: 'T'
}, {
    id: 'gods-hand',
    title: "God's hand in my life",
    description: 'and ways he is working through me and others',
    icon: 'H',
}, {
    id: 'experiences',
    title: 'Processing my experiences',
    description: 'and reports on events, or plans for the future.',
    icon: 'E'
}];

export type Item = {
    id: string,
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

const prayerJournalModule = {
    name: 'prayerJournal',
    builder: (priv: any, pub: any) => {

        priv.declareType('item', {
            type: 'object',
            properties: {
                id: { type: 'string' },
                kind: { type: 'string' },
                text: { type: 'string' },
                active: { type: 'boolean' },
                createdDate: { type: 'number' },
                activityHistory: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            active: { type: 'boolean' },
                            date: { type: 'number' },
                        },
                        required: ['active', 'date'],
                    },
                },
                comments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            text: { type: 'string' },
                            date: { type: 'number' },
                            inReplyTo: { type: 'string' },
                        },
                        required: ['text', 'date'],
                    },
                },
            },
            required: ['id', 'kind', 'text', 'createdDate', 'active', 'activityHistory', 'comments'],
        });

        priv.declareType('item-kind', {
            type: 'object',
            properties: {
                id: { type: 'string', },
                title: { type: 'string', },
                description: { type: 'string', },
                icon: { type: 'string', },
                color: { type: 'string', },
            },
            required: ['id', 'title', 'icon'],
        });

        const kindPath = id => `kinds/${id}`
        const itemPath = id => `items/${id}`
        window.priv = priv

        const onPath = (path, fn) => {
            let data = {}
            priv.getAll(path + '/').then(listing => {
                data = listing;
                fn(listing)
            });
            const listener = (evt) => {
                // console.log('listen', evt, path)
                const [one, id] = evt.relativePath.split('/')
                if (one !== path) {
                    return
                }
                data = {...data, [id]: evt.newValue}
                // console.log('send', path, data)
                fn(data)
            };
            priv.on('change', listener);
            return () => {
                priv.off('change', listener)
            }
        }

        return {
            exports: {
                addKind: async (kind: Kind) => {
                    var path = kindPath(kind.id); // use hashed URL as filename as well
                    await priv.storeObject("item-kind", path, kind);
                    return kind;
                },
                addItem: async (item: Item) => {
                    var path = itemPath(item.id);
                    await priv.storeObject("item", path, item);
                    return item;
                },
                getKinds: async () => {
                    return priv.getListing('kinds/')
                },
                getKind: (id: string) => priv.getObject(kindPath(id)),
                onKinds: (fn: any) => onPath('kinds', fn),
                onItems: (fn: any) => onPath('items', fn),
            }
        }
    }
}

export default prayerJournalModule