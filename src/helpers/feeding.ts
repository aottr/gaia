import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { addDays, startOfToday } from 'date-fns';
import { TaskType, Task } from '@/types/task';
import { updateReminder } from '@/helpers/reminder';


export const feedAnimal = async (animal: Record, food: Record | null, amount: number, date: Date) => {

    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
    const feeding = await pb.collection('feeding').create({
        animal: animal.id,
        food: food ? food.id : null,
        amount: food ? amount : '0',
        date,
        refused: food === null
    });

    const feedingType = await pb.collection('task_type').getFirstListItem<TaskType>('name~"feeding"');

    // add task
    const latest_task = await pb.collection('task').create<Task>({
        type: feedingType.id,
        animal: animal.id,
        date: date,
        extension: {
            id: food ? food.id : '',
            feeder: food ? food.name : '',
            amount: food ? amount : '0'
        }
    });
    if (!latest_task || !feedingType) {
        pb.collection('feeding').delete(feeding.id);
        throw new Error('Could not create feeding task. Feeding has been deleted.');
    }

    updateReminder(animal, feedingType, latest_task);
    return feeding;
};

export const autoFeeding = async (animal: Record) => {

    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
    const feeder = await pb.collection('feeder_animal').getOne<Record>(animal.default_food_feeder);

    const feeding = await feedAnimal(
        animal,
        feeder,
        animal.default_food_amount == '0' ? 1 : animal.default_food_amount,
        new Date()
    );
    if (feeding) return true;
    return false;
};

