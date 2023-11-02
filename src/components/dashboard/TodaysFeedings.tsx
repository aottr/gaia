import useSWR, { mutate } from 'swr';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { IconToolsKitchen2, IconExternalLink, IconBug, IconSum } from '@tabler/icons-react';
import Link from 'next/link';
import useNotification from '@/hooks/useNotification';
import { autoFeeding } from '@/helpers/feeding';
import { useState, useEffect } from 'react';

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

    const [feederList, setFeederList] = useState<Object>({});
    const [autoFeedLoading, setAutoFeedLoading] = useState<boolean>(false);

    const fetcher = () => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        return pb.collection("todays_reminders").getFullList<NotificationRecord>(100, {
            expand: "animal.default_food_feeder,latest", filter: 'name ~ "Feeding"'
        }).then((res) => { return res; });
    }

    const { addNotification } = useNotification();

    const tryAutoFeding = async (animal: Record) => {
        setAutoFeedLoading(true);
        if (!animal.default_food_feeder || animal.default_food_amount <= 0) {
            addNotification(`Auto Feeding is not configured for this animal.`, 'error');
            return;
        }
        if (await autoFeeding(animal)) {
            addNotification(`${animal.name || animal.code || 'EEE'} has been fed.`, 'success');
            setTimeout(() => {
                mutate('feeding_notification'); // force refresh
                setAutoFeedLoading(false);
            }, 2000);
            return;
        }
        addNotification(`${animal.name || animal.code || 'EEE'} could not be fed.`, 'error');
        setAutoFeedLoading(false);
    };

    const tryAutoFeedingAll = async (notifications: NotificationRecord[]) => {
        setAutoFeedLoading(true);
        const animals = notifications.map((n) => n.expand.animal).filter((a) => a.default_food_feeder && a.default_food_amount > 0);
        const failed = await Promise.all(animals.map((a) => autoFeeding(a)));
        if (failed.every((f) => f)) {
            addNotification(`All animals have been fed.`, 'success');
            setTimeout(() => {
                mutate('feeding_notification'); // force refresh
                setAutoFeedLoading(false);
            }, 2000);
            return;
        }
        addNotification(`Some animals could not be fed.`, 'error');
        setAutoFeedLoading(false);
    }

    const { data, error, isLoading } = useSWR('feeding_notification', fetcher);

    useEffect(() => {
        if (!data) return;
        console.log(data);
        const feederlist = data.reduce((acc: { [key: string]: number }, entry) => {
            const name = entry.expand.animal.expand.default_food_feeder?.name;
            if (name) {
                if (acc[name]) {
                    acc[name] += entry.expand.animal.default_food_amount;
                } else {
                    acc[name] = entry.expand.animal.default_food_amount;
                }
            }
            return acc;
        }, {});
        setFeederList(feederlist);
    }, [data]);

    return (
        <div className='bg-base-200 rounded-xl'>
            <h1 className='text-xl py-2 pl-4 pr-2 border-b-4 border-primary flex'>
                <IconToolsKitchen2 size={26} className="inline" />
                <span className='font-bold'>Today&apos;s</span>
                Feedings
                <span className='flex-grow' />
                {data && feederList && Object.keys(feederList).length > 0 && <span className={`btn btn-xs btn-primary ${autoFeedLoading ? 'btn-disabled' : ''}`} onClick={() => tryAutoFeedingAll(data)}>
                    {autoFeedLoading ? (<>
                        <span className="loading loading-spinner loading-xs"></span>
                        Loading
                    </>) : (<>
                        Auto Feed all <IconBug size={16} className='inline' />
                    </>)}
                </span>}
            </h1>
            {isLoading && <div className='text-center py-10'><span className="loading loading-ring text-primary loading-lg"></span></div>}
            {data && data.map((notification) => (
                <div key={notification.id} className='border-b border-base-100 last:border-b-0 flex items-center'>
                    <div className='py-2 px-4'>
                        {notification.expand.animal.name || notification.expand.animal.code || notification.expand.animal.expand.species.common_name}
                    </div>
                    <div className='flex-grow'></div>
                    <div className='items-end px-2'>
                        {notification.expand.animal.default_food_feeder && notification.expand.animal.default_food_amount > 0 && <>
                            <div className="tooltip tooltip-bottom" data-tip={`${notification.expand.animal.default_food_amount}x ${notification.expand.animal.expand.default_food_feeder?.name}`}>
                                <span className={`btn btn-xs btn-primary ${autoFeedLoading ? 'btn-disabled' : ''} mr-2`} onClick={() => tryAutoFeding(notification.expand.animal)}>
                                    {autoFeedLoading ? (<>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        Loading
                                    </>) : (<>
                                        Auto Feed <IconBug size={16} className='inline' />
                                    </>)}
                                </span>
                            </div>
                        </>}
                        <Link href={`/animals/${notification.animal}/feed/add`} className='btn btn-xs btn-secondary'>
                            Feed <IconExternalLink size={16} className='inline' />
                        </Link>
                    </div>
                </div>
            ))}
            {feederList && Object.keys(feederList).length > 0 && (
                <div className='flex'>
                    <div className='p-2'>
                        <IconSum size={24} className='inline' />
                    </div>
                    <div className='flex-grow'>

                    </div>
                    <div className='p-2'>
                        {Object.entries(feederList).map(([key, value]) => (
                            <div key={key} className='join ml-1'>
                                <span className='badge badge-secondary badge-outline join-item'>{value}x</span>
                                <span className='badge badge-secondary join-item'>{key}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default TodaysFeedingsComponent;