import useSWR, { mutate } from 'swr';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { IconToolsKitchen2, IconExternalLink, IconBug } from '@tabler/icons-react';
import Link from 'next/link';
import useNotification from '@/hooks/useNotification';
import { autoFeeding } from '@/helpers/feeding';

type NotificationRecord = Record & {
    animal: string,
    date: string,
    day_interval: number,
    expand: {
        animal: Record & { expand: Record },
        latest: Record,
    }
};

const TodaysFeedingsComponent = () => {

    const fetcher = () => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        return pb.collection("feeding_notification").getFullList<NotificationRecord>(100, {
            expand: "animal.species,latest.food", filter: 'date < @todayEnd'
        }).then((res) => { return res; });
    }

    const { addNotification } = useNotification();

    const tryAutoFeding = async (animal: Record) => {

        if (!animal.default_food_feeder || animal.default_food_amount <= 0) {
            addNotification(`Auto Feeding is not configured for this animal.`, 'error');
            return;
        }
        if (await autoFeeding(animal)) {
            addNotification(`${animal.name || animal.code || 'EEE'} has been fed.`, 'success');
            mutate('feeding_notification'); // force refresh
            return;
        }
        addNotification(`${animal.name || animal.code || 'EEE'} could not be fed.`, 'error');
    };

    const { data, error, isLoading } = useSWR('feeding_notification', fetcher);
    return (
        <div className='bg-base-200 rounded-xl'>
            <h1 className='text-xl py-2 px-4 border-b-4 border-primary'><IconToolsKitchen2 size={26} className="inline" /> <span className='font-bold'>Today's</span> Feedings</h1>
            {isLoading && <div className='text-center py-10'><span className="loading loading-ring text-primary loading-lg"></span></div>}
            {data && data.map((notification) => (
                <div key={notification.id} className='border-b border-base-100 last:border-b-0 flex items-center'>
                    <div className='py-2 px-4'>{notification.expand.animal.name || notification.expand.animal.code || notification.expand.animal.expand.species.common_name}</div>
                    <div className='flex-grow'></div>
                    <div className='items-end px-2'>
                        {notification.expand.animal.default_food_feeder && notification.expand.animal.default_food_amount > 0 && <span className='btn btn-xs btn-primary mr-2' onClick={() => tryAutoFeding(notification.expand.animal)}>
                            Auto Feed <IconBug size={16} className='inline' />
                        </span>}
                        <Link href={`/animals/${notification.animal}/feed/add`} className='btn btn-xs btn-secondary'>
                            Feed <IconExternalLink size={16} className='inline' />
                        </Link>
                    </div>
                </div>
            ))}

        </div>
    )
}

export default TodaysFeedingsComponent;