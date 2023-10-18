import Breadcrumbs from '@/components/Breadcrumbs';
import { IconToolsKitchen2, IconX } from '@tabler/icons-react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { isPast, addDays } from 'date-fns';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import TodaysFeedingsComponent from '@/components/dashboard/TodaysFeedings';

const DashboardPage = () => {

    const router = useRouter();

    const [animals, setAnimals] = useState<Array<Record>>([]);

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }
        const fetchAnimal = async () => {
            try {
                const res = await pb.collection('animal').getFullList({ expand: 'species.classification,feeding(animal),feeding_notification(animal),default_food_feeder,rack_assignment(animal).rack' });
                console.log(res);
                setAnimals(res);
            } catch (err) {
                console.log(err);
                router.push('/species');
            }
        };
        if (router.isReady) {
            fetchAnimal();
        }
    }, [router.isReady]);

    const getLastFeeding = (animal: Record) => {
        if (!animal?.expand['feeding(animal)']) {
            return null;
        }
        const lastFeeding = [...(animal?.expand['feeding(animal)'] as unknown as Array<Record>)].sort((a: any, b: any) => (new Date(a.date).getTime() - new Date(b.date).getTime())).reverse()[0];
        return lastFeeding;
    }

    const getFeedingNotification = (animal: Record): { interval: number, time: Date } => {
        const feedingNotification = (animal?.expand['feeding_notification(animal)'] as unknown as Array<{ day_interval: number, notification_time: string }>)[0];
        return {
            interval: feedingNotification.day_interval,
            time: new Date()
        }
    }

    let todaysFeedings: Record[] = [];
    //const { addAlert } = useContext(ToastAlertContext);
    return (
        <>
            <Breadcrumbs />
            <div className="grid grid-col-1 lg:grid-cols-2 gap-4 p-4">
                <div className="lg:col-span-2">
                    <h1 className='text-2xl text-center my-8'>Dashboard</h1>
                </div>
                <TodaysFeedingsComponent />
            </div>
        </>
    )
};

export default DashboardPage;