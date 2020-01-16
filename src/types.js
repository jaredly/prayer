// @flow

export type Kind = {
    id: string,
    title: string,
    description: string,
    color?: string,
    icon: string,
};

export type Item = {
    id: string,
    kind: string,
    text: string,
    active: boolean,
    createdDate: number,
    modifiedDate: ?number,
    activityHistory: Array<{ active: boolean, date: number }>,
    thoughts: ?Array<{ text: string, date: number }>,
};

export const itemSchema = {
    version: 0,
    type: 'object',
    properties: {
        id: { type: 'string', primary: true },
        kind: { type: 'string' },
        text: { type: 'string' },
        active: { type: 'boolean' },
        createdDate: { type: 'number' },
        modifiedDate: { type: 'number' },
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
        thoughts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    date: { type: 'number' },
                },
                required: ['text', 'date'],
            },
        },
    },
    required: [
        'id',
        'kind',
        'text',
        'createdDate',
        'modifiedDate',
        'active',
        'activityHistory',
    ],
};

export type Record = {
    id: string,
    createdDate: number,
    finishedDate?: number,
    notes: { [key: string]: string },
    generalNotes: string,
};

export const itemKindSchema = {
    version: 0,
    type: 'object',
    properties: {
        id: { type: 'string', primary: true },
        title: { type: 'string' },
        description: { type: 'string' },
        icon: { type: 'string' },
        color: { type: 'string' },
    },
    required: ['id', 'title', 'icon'],
};

export const defaultTypes: Array<Kind> = [
    {
        id: 'people',
        title: 'People in need',
        description: 'People that I know who need help',
        icon: 'P',
    },
    {
        id: 'questions',
        title: 'Questions I have',
        description: 'Probably mostly doctrinal',
        icon: '?',
    },
    {
        id: 'guidence',
        title: 'Requests for guidence',
        description: 'Lead kindly light',
        icon: 'G',
    },
    {
        id: 'requests',
        title: 'General requests',
        description: 'Misc needs, wants, etc.',
        icon: 'R',
    },
    {
        id: 'gratitude',
        title: 'Gratitude',
        description: "Things I'm grateful for today",
        icon: 'T',
    },
    {
        id: 'gods-hand',
        title: "God's hand in my life",
        description: 'and ways he is working through me and others',
        icon: 'H',
    },
    {
        id: 'experiences',
        title: 'Processing my experiences',
        description: 'and reports on events, or plans for the future.',
        icon: 'E',
    },
];

export const emptyRecord = (): Record => ({
    id: 'tmp',
    createdDate: Date.now(),
    notes: {},
    generalNotes: '',
});

export const recordSchema = {
    version: 0,
    type: 'object',
    properties: {
        id: { type: 'string', primary: true },
        createdDate: { type: 'number' },
        finishedDate: { type: 'number' },
        notes: { type: 'object', additionalProperties: { type: 'string' } },
        generalNotes: { type: 'string' },
    },
    required: ['id', 'createdDate', 'notes', 'generalNotes'],
};
