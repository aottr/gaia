import { Task, TaskType } from '@/types/task';
import PocketBase, { Record } from 'pocketbase';
import getConfig from 'next/config';
import { addDays, startOfToday, startOfDay } from 'date-fns';

export const WEEK_DAYS: Weekday[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export type Weekday = "Su" | "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa";

export const getNextDate = (weekdays: Weekday[], startDate: Date | null = null) => {

    if (!startDate) startDate = startOfToday();
    if (weekdays.length === 0) return startDate;
    while (!weekdays.includes(WEEK_DAYS[startDate.getDay()])) {
        startDate = addDays(startDate, 1);
    }

    return startDate;
};

export const updateReminder = async (animal: Record, type: TaskType, latest: Task) => {

    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
    try {
        const reminder = await pb.collection('reminder').getFirstListItem<Task>(`animal.id = "${animal.id}" && type.id = "${type.id}"`);
        if (!reminder) false;

        // if task was in the past, add default interval to today, if in future, add default interval to next day
        const nextScheduledDate = calculateNextDate(reminder.interval, reminder.weekday, latest);

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

const calculateNextDate = (interval: number, weekdays: Weekday[], latest: Task | null = null) => {
    const startDate = latest && new Date(latest.date) > addDays(startOfToday(), 1) ? addDays(new Date(latest.date), 1) : addDays(startOfToday(), 1);
    const date = weekdays.length === 0 ? addDays(startDate, interval) : getNextDate(weekdays, startDate);
    return date;
};

export const createReminder = async (animal: Record | null, type: TaskType, interval: number, weekdays: Weekday[], latest: Task | null = null) => {
    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

    // check if in future or past
    const date = calculateNextDate(interval, weekdays, latest);
    let existingReminder = null;
    try {
        existingReminder = await pb.collection('reminder').getFirstListItem<Task>(`animal = "${animal ? animal.id : ''}" && type.id = "${type.id}"`);
    } catch { } // ignore errors

    try {
        if (existingReminder) {
            await pb.collection('reminder').update(existingReminder.id, {
                animal: animal ? animal.id : null,
                type: type.id,
                latest: latest ? latest.id : null,
                date,
                interval,
                weekday: weekdays
            });
            return true;
        }
        await pb.collection('reminder').create({
            animal: animal ? animal.id : null,
            type: type.id,
            latest: latest ? latest.id : null,
            date,
            interval,
            weekday: weekdays
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}