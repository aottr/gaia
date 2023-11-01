import { Record } from 'pocketbase';
import { TaskType, Task } from './task';

export type Reminder = Record & {
    type: TaskType,
    interval: number,
    animal: Record[],
    date: string,
    latest?: Task,
    expand?: {
        type: TaskType,
        latest?: Task
    }
};

export type LatestBase = { id: string, date: string };
export type LatestFeeding = LatestBase & { feeder: string, amount: number };
export type LatestWeighting = LatestBase & { weight: number };
