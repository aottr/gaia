import { Task, TaskType } from '@/types/task';
import PocketBase, { Record } from 'pocketbase';
import getConfig from 'next/config';
import { addDays, startOfToday, startOfDay } from 'date-fns';

export const updateReminder = async (animal: Record, type: TaskType, latest: Task) => {

    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
    try {
        const reminder = await pb.collection('reminder').getFirstListItem<Task>(`animal.id = "${animal.id}" && type.id = "${type.id}"`);
        if (!reminder) false;

        const taskDate = new Date(latest.date);
        // if task was in the past, add default interval to today, if in future, add default interval to next day
        const nextScheduledDate = taskDate.getDate() < new Date().getDate() ? addDays(startOfToday(), reminder.interval) : addDays(startOfDay(taskDate), reminder.interval);

        await pb.collection('reminder').update(reminder.id, {
            latest: latest.id,
            date: nextScheduledDate
        });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};