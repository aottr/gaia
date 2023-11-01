import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { TaskType, Task } from '@/types/task';
import { updateReminder } from '@/helpers/reminder';

export const weightAnimal = async (animal: Record, weight: number, size: number | null, date: Date) => {

    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
    const weightRecord = await pb.collection('weight').create({
        animal: animal.id,
        value: weight,
        size,
        date
    });

    const weightType = await pb.collection('task_type').getFirstListItem<TaskType>('name~"weighting"');

    // add task
    const latest_task = await pb.collection('task').create<Task>({
        type: weightType.id,
        animal: animal.id,
        date: date,
        extension: {
            id: weightRecord.id,
            weight,
            size
        }
    });
    if (!latest_task || !weightType) {
        pb.collection('weight').delete(weightRecord.id);
        throw new Error('Could not create weight task. Weight has been deleted.');
    }

    updateReminder(animal, weightType, latest_task);
    return weightRecord;
}