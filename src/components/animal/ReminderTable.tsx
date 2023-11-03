import { useEffect, useState } from 'react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { IconScaleOutline, IconCloudRain, IconPoo, IconBug, IconAlarm } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Reminder, } from '@/types/reminder';
import { Task, TaskType } from '@/types/task';

const reminderIcon = (type: TaskType) => {
    switch (type.name.toLowerCase()) {
        case 'misting':
            return <IconCloudRain size={20} className='inline' />
        case 'feeding':
            return <IconBug size={20} className='inline' />
        case 'weighting':
            return <IconScaleOutline size={20} className='inline' />
        case 'maintenance':
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

type ReminderTableProps = {
    animal: Record;
}


const ReminderTable = ({ animal }: ReminderTableProps) => {

    const [reminders, setReminders] = useState<Reminder[]>([]);

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const fetchReminders = async () => {
            const reminders = await pb.collection('reminder').getFullList<Reminder>({ filter: `animal.id = "${animal.id}"`, expand: 'type,latest' });
            setReminders(reminders);
        };

        if (animal && animal.id) {
            fetchReminders();
        }
    }, [animal]);

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>How often</th>
                    <th>When</th>
                    <th>Latest</th>
                </tr>
            </thead>
            <tbody>
                {reminders.map((reminder: Reminder, i) => (
                    <tr key={i}>
                        <th><span className='btn btn-ghost btn-sm'>{reminderIcon(reminder.expand.type)} {reminder.expand.type.name}</span></th>
                        <td>every
                            {reminder.weekday.length > 0
                                ? reminder.weekday.map((day: string) => (<span key={`${reminder.id}-${day}`} className='badge badge-sm badge-primary mx-1'>{day}</span>))
                                : <span className='badge badge-sm badge-primary ml-1'>{reminder.interval} days</span>}
                        </td>
                        <td>{format(new Date(reminder.date), 'eee. dd.MM.yyyy')}</td>
                        <td>{reminder.expand.latest ? reminderLatest(reminder.expand.type, reminder.expand.latest) : ('never')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default ReminderTable;