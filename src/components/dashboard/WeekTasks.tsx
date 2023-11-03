import useSWR, { mutate } from 'swr';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { IconToolsKitchen2, IconExternalLink, IconBug, IconSum } from '@tabler/icons-react';
import Link from 'next/link';
import useNotification from '@/hooks/useNotification';
import { autoFeeding } from '@/helpers/feeding';
import { useState, useEffect } from 'react';
import { Reminder } from '@/types/reminder';
import { Task, TaskType } from '@/types/task';
import { WEEK_DAYS } from '@/helpers/reminder';
import { addDays, endOfToday, format, startOfToday } from 'date-fns';

type AnimalExtension = Reminder & { expand: { animal: Record } };

const WeekTasks = () => {

    const fetcher = () => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        return pb.collection("reminder").getFullList<AnimalExtension>(150, {
            expand: "type,latest,animal", filter: `date > "${format(startOfToday(), 'yyyy-MM-dd HH:mm:ss')}" && date < "${format(addDays(endOfToday(), 7), 'yyyy-MM-dd HH:mm:ss')}"`
        }).then((res) => { return res; });
    }

    const { data, error, isLoading } = useSWR('reminders', fetcher);

    const todayIndex = new Date().getDay();
    const orderedWeekDays = [...WEEK_DAYS.slice(todayIndex), ...WEEK_DAYS.slice(0, todayIndex)];

    return (
        <div className='bg-base-200 rounded-xl'>
            <h1 className='text-xl py-2 pl-4 pr-2 border-b-4 border-primary flex'>7 Day Tasks</h1>
            <div className='grid grid-cols-7'>
                {orderedWeekDays.map((day, index) => (
                    <div key={index} className='border-r border-base-300 last:border-0'>
                        <h2 className='bg-base-300 text-center p-1'>{day}</h2>
                        {data && Object.entries(
                            data
                                .filter(reminder => new Date(reminder.date).getDay() === (todayIndex + index) % 7)
                                .reduce((acc, reminder) => {
                                    acc[reminder.expand.type.name] = (acc[reminder.expand.type.name] || []).concat(reminder);
                                    return acc;
                                }, {} as { [key: string]: AnimalExtension[] })
                        ).map(([typeName, reminders], i) => (
                            <div key={i}>
                                <div className='tooltip tooltip-bottom w-full p-1' data-tip={
                                    reminders.map((reminder: AnimalExtension, j: number) => (
                                        reminder.expand.animal.name || reminder.expand.animal.code
                                    )).join(', ')
                                }>
                                    <div className='badge badge-primary rounded-md w-full'>{typeName}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeekTasks;