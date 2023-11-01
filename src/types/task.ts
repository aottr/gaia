import { Record } from 'pocketbase';

export type TaskType = Record & {
    name: string,
    default_interval: number,
    badge_colour: string
};

export type Task = Record & {
    type: TaskType,
    date: string,
    animal: Record[],
    note: string,
    extension: any
};