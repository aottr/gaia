import { IconBug, IconCloudRain, IconScaleOutline, IconPoo, IconWorldOff } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import NumberField from '../inputs/NumberField';
import WeekDaySelect from '../inputs/WeekDaySelect';
import PocketBase, { Record } from 'pocketbase';
import getConfig from 'next/config';
import { createReminder, Weekday } from '@/helpers/reminder';
import { TaskType } from '@/types/task';
import useNotification from '@/hooks/useNotification';

type Reminder = Record & { expand: Record };

const ReminderSetup = ({ animal }: { animal: Record }) => {

    const { addNotification } = useNotification();

    useEffect(() => {

        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const fetchReminders = async () => {
            const reminders = await pb.collection('reminder').getFullList<Reminder>({ filter: `animal="${animal.id}"`, expand: 'type' });

            reminders.forEach((reminder: Reminder) => {
                console.log(reminder.expand.type.name);
                switch (reminder.expand.type.name) {
                    case 'Feeding':
                        setFeedingReminder(true);
                        setFeedingInterval(reminder.interval);
                        setFeedingSelectedDays(reminder.weekday);
                        break;
                    case 'Weighting':
                        setWeightReminder(true);
                        setWeightingInterval(reminder.interval);
                        break;
                    case 'Misting':
                        setMistingReminder(true);
                        setMistingInterval(reminder.interval);
                        break;
                    case 'Maintenance':
                        setMaintenanceReminder(true);
                        setMaintenanceInterval(reminder.interval);
                        break;
                    default:
                        console.log(`Unknown reminder name: ${reminder.name}`);
                }
            });
        }
        if (animal) fetchReminders();
    }, [animal]);

    const [feedingReminder, setFeedingReminder] = useState(false);
    const [weightReminder, setWeightReminder] = useState(false);
    const [mistingReminder, setMistingReminder] = useState(false);

    const [mistingInterval, setMistingInterval] = useState<number>(3);
    const [feedingInterval, setFeedingInterval] = useState<number>(3);
    const [feedingSelectedDays, setFeedingSelectedDays] = useState<Weekday[]>([])
    const [weightingInterval, setWeightingInterval] = useState<number>(30);
    const [maintenanceInterval, setMaintenanceInterval] = useState<number>(3);

    const [maintenanceReminder, setMaintenanceReminder] = useState(false);
    /*
    const [cleaningReminder, setCleaningReminder] = useState(false);
    const [washingReminder, setWashingReminder] = useState(false);
    const [waterChangeReminder, setWaterChangeReminder] = useState(false);
    */

    const saveReminders = async () => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const reminders = await pb.collection('reminder').getFullList<Reminder>({ filter: `animal="${animal.id}"`, expand: 'type,latest' });

        const feedingExists = reminders.find(r => r.expand.type.name === 'Feeding');
        console.log(feedingExists)
        if (feedingReminder && !feedingExists) { // create
            const feedingType = await pb.collection('task_type').getFirstListItem<TaskType>('name="Feeding"');
            const created = await createReminder(animal, feedingType, feedingInterval, feedingSelectedDays);
            if (created) addNotification('Feeding reminder created', 'success');
            else addNotification('Failed to create feeding reminder', 'error');
        }
        else if (!feedingReminder && feedingExists) { // delete
            pb.collection('reminder').delete(feedingExists.id);
            addNotification('Feeding reminder deleted', 'info');
        }
        else if (feedingReminder && feedingExists && (feedingExists.interval != feedingInterval || JSON.stringify(feedingExists.weekday) !== JSON.stringify(feedingSelectedDays))) { // update
            console.log(feedingExists.interval, feedingInterval, feedingExists.weekday, feedingSelectedDays)
            const updated = await createReminder(animal, feedingExists.expand.type, feedingInterval, feedingSelectedDays, feedingExists.expand.latest);
            if (updated) addNotification('Feeding reminder updated.', 'success');
            else addNotification('Failed to update feeding reminder', 'error');
        } // update

        const weightingExists = reminders.find(r => r.expand.type.name === 'Weighting');
        if (weightReminder && !weightingExists) { // create
            const weightingType = await pb.collection('task_type').getFirstListItem<TaskType>('name="Weighting"');
            const created = await createReminder(animal, weightingType, weightingInterval, []);
            if (created) addNotification('Weighting reminder created', 'success');
            else addNotification('Failed to create weighting reminder', 'error');
        } else if (!weightReminder && weightingExists) { // delete
            pb.collection('reminder').delete(weightingExists.id);
            addNotification('Weighting reminder deleted.', 'info');
        }
        else if (weightReminder && weightingExists && weightingExists.interval != weightingInterval) {
            const updated = await createReminder(animal, weightingExists.expand.type, weightingInterval, [], weightingExists.expand.latest);
            if (updated) addNotification('Weighting reminder updated.', 'success');
            else addNotification('Failed to update weighting reminder', 'error');
        } // update

        const mistingExists = reminders.find(r => r.expand.type.name === 'Misting');
        if (mistingReminder && !mistingExists) { // create
            const mistingType = await pb.collection('task_type').getFirstListItem<TaskType>('name="Misting"');
            const created = await createReminder(animal, mistingType, mistingInterval, []);
            if (created) addNotification('Misting reminder created', 'success');
            else addNotification('Failed to create misting reminder', 'error');
        } else if (!mistingReminder && mistingExists) { // delete
            pb.collection('reminder').delete(mistingExists.id);
            addNotification('Misting reminder deleted.', 'info');
        }
        else if (mistingReminder && mistingExists && mistingExists.interval != mistingInterval) {
            const updated = await createReminder(animal, mistingExists.expand.type, mistingInterval, [], mistingExists.expand.latest);
            if (updated) addNotification('misting reminder updated.', 'success');
            else addNotification('Failed to update misting reminder', 'error');
        } // update

        const maintenanceExists = reminders.find(r => r.expand.type.name === 'Maintenance');
        if (maintenanceReminder && !maintenanceExists) { // create
            const maintenanceType = await pb.collection('task_type').getFirstListItem<TaskType>('name="Maintenance"');
            const created = await createReminder(animal, maintenanceType, maintenanceInterval, []);
            if (created) addNotification('Maintenance reminder created', 'success');
            else addNotification('Failed to create maintenance reminder', 'error');
        } else if (!maintenanceReminder && maintenanceExists) { // delete
            pb.collection('reminder').delete(maintenanceExists.id);
            addNotification('Maintenance reminder deleted.', 'info');
        } else if (maintenanceReminder && maintenanceExists && maintenanceExists.interval != maintenanceInterval) {
            const updated = await createReminder(animal, maintenanceExists.expand.type, maintenanceInterval, [], maintenanceExists.expand.latest);
            if (updated) addNotification('Maintenance reminder updated.', 'success');
            else addNotification('Failed to update maintenance reminder', 'error');
        } // update
    };

    return (
        <>
            <div className='grid md:grid-cols-2 gap-2 place-items-start'>
                <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                    <label className="cursor-pointer label">
                        <span className="label-text text-xl">
                            <IconBug size={24} className='inline text-primary mr-2' />
                            Feeding
                        </span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={feedingReminder} onChange={(e) => setFeedingReminder(e.target.checked)} />
                    </label>
                    {feedingReminder && <div className='p-2'>
                        <NumberField label='Interval in days' value={feedingInterval} onChange={setFeedingInterval} disabled={feedingSelectedDays && feedingSelectedDays.length > 0} />
                        <WeekDaySelect onSelectedDaysChange={setFeedingSelectedDays} label='On specific weekdays' initialSelectedDays={feedingSelectedDays} />
                    </div>}
                </div>
                <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                    <label className="cursor-pointer label">
                        <span className="label-text text-xl"><IconCloudRain size={24} className='inline text-primary mr-2' />Misting</span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={mistingReminder} onChange={(e) => setMistingReminder(e.target.checked)} />
                    </label>
                    {mistingReminder && <div className='p-2'>
                        <NumberField label='Interval in days' value={mistingInterval} onChange={setMistingInterval} />
                        {/*<WeekDaySelect onSelectedDaysChange={handleSelectedDaysChange} label='On specific weekdays' />*/}
                    </div>}
                </div>
                <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                    <label className="cursor-pointer label">
                        <span className="label-text text-xl"><IconScaleOutline size={24} className='inline text-primary mr-2' />Weighting and Measure</span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={weightReminder} onChange={(e) => setWeightReminder(e.target.checked)} />
                    </label>
                    {weightReminder && <div className='p-2'>
                        <NumberField label='Interval in days' value={weightingInterval} onChange={setWeightingInterval} />
                        {/*<WeekDaySelect onSelectedDaysChange={handleSelectedDaysChange} label='On specific weekdays' />*/}
                    </div>}
                </div>
                <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                    <label className="cursor-pointer label">
                        <span className="label-text text-xl"><IconPoo size={24} className='inline text-primary mr-2' />Maintenance <IconWorldOff size={24} className='inline' /></span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={maintenanceReminder} onChange={(e) => setMaintenanceReminder(e.target.checked)} />
                    </label>
                    {maintenanceReminder && <div className='p-2'>
                        <NumberField label='Interval in days' value={maintenanceInterval} onChange={setMaintenanceInterval} />
                        {/*<WeekDaySelect onSelectedDaysChange={handleSelectedDaysChange} label='On specific weekdays' />*/}
                    </div>}
                </div>
                {/**
            <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                <label className="cursor-pointer label">
                    <span className="label-text text-xl"><IconPoo size={24} className='inline text-primary mr-2' />Cleaning <IconWorldOff size={24} className='inline' /></span>
                    <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={cleaningReminder} onChange={(e) => setCleaningReminder(e.target.checked)} />
                </label>
            </div>
            <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                <label className="cursor-pointer label">
                    <span className="label-text text-xl">Water change <IconWorldOff size={24} className='inline' /></span>
                    <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={waterChangeReminder} onChange={(e) => setWaterChangeReminder(e.target.checked)} />
                </label>
            </div>
            <div className="form-control w-full p-2 bg-base-100 rounded-xl">
                <label className="cursor-pointer label">
                    <span className="label-text text-xl">Deep Washing <IconWorldOff size={24} className='inline' /></span>
                    <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={washingReminder} onChange={(e) => setWashingReminder(e.target.checked)} />
                </label>
            </div>
             */}
            </div>
            <div className='pt-3 flex justify-end'>
                <button className='btn btn-primary' onClick={() => saveReminders()}>Save</button>
            </div>
        </>
    )
};

export default ReminderSetup;