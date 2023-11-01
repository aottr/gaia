import { useEffect, useState } from 'react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { IconScaleOutline, IconCloudRain, IconPoo, IconBug, IconAlarm } from '@tabler/icons-react';
import { format } from 'date-fns';
import { LatestBase, LatestFeeding, LatestWeighting, Reminder, } from '@/types/reminder';
import { Task, TaskType } from '@/types/task';

const reminderIcon = (type: TaskType) => {
    switch (type.name.toLowerCase()) {
        case 'misting':
            return <IconCloudRain size={20} className='inline' />
        case 'feeding':
            return <IconBug size={20} className='inline' />
        case 'weighting':
            return <IconScaleOutline size={20} className='inline' />
        case 'cleaning':
            return <IconPoo size={20} className='inline' />
        default:
            return <IconAlarm size={20} className='inline' />
    }
}

const reminderLatest = (type: TaskType, latest: Task) => {
    switch (type.name.toLowerCase()) {
        case 'feeding':
            return <>{latest.extension && (`${latest.extension.amount}x ${latest.extension.feeder}`)}</>
        default:
            return <>{format(new Date(latest.date), 'eee. dd.MM.yyyy')}</>
    }
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const DynamicReminderIndex = () => {

    const router = useRouter();
    const [reminders, setReminders] = useState<Reminder[]>([]);

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const fetchReminders = async () => {
            const reminders = await pb.collection('reminder').getFullList<Reminder>({ filter: `animal.id = "${router.query.id}"`, expand: 'type,latest' });
            setReminders(reminders);
        };

        if (router.isReady && router.query.id) {
            fetchReminders();
        }
    }, [router.isReady]);

    return (
        <div>
            <h1>Reminder Index</h1>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>How often</th>
                            <th>When</th>
                            <th>Latest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reminders.map((reminder: Reminder, i) => (
                            <tr key={i}>
                                <th><span className='btn btn-ghost btn-sm'>{reminderIcon(reminder.expand.type)} {reminder.expand.type.name}</span></th>
                                <td>every {reminder.interval} days</td>
                                <td>{format(new Date(reminder.date), 'eee. dd.MM.yyyy')}</td>
                                <td>{reminder.expand.latest ? reminderLatest(reminder.expand.type, reminder.expand.latest) : ('never')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DynamicReminderIndex;