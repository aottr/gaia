import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { addDays, startOfToday } from 'date-fns';

export const updateFeedingNotification = async (animal: Record, feeding: Record) => {

    const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
    try {

        const notification = await pb.collection('feeding_notification').getFirstListItem(`animal="${animal.id}"`);
        if (!notification) true;

        // add notification for 1am local time + days
        await pb.collection('feeding_notification').update(notification.id, {
            latest: feeding.id,
            date: addDays(startOfToday(), notification.day_interval)
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const autoFeeding = async (animal: Record) => {

    try {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const res = await pb.collection('feeding').create({
            animal: animal.id,
            food: animal.default_food_feeder,
            amount: animal.default_food_amount == '0' ? 1 : animal.default_food_amount,
            date: new Date(),
        })

        if (res) {
            if (await updateFeedingNotification(animal, res)) {
                return true;
            }
            pb.collection('feeding').delete(res.id);
        }

    } catch (err) {
        console.log(err);
    }
    return false;
};

