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
                const res = await pb.collection('animal').getFullList({ expand: 'species.classification,feeding(animal),default_food_feeder,rack_assignment(animal).rack' });
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

    return (
        <>
            <Breadcrumbs />
            <div className="grid grid-col-1 lg:grid-cols-2 gap-4 p-4">
                <div className="lg:col-span-2">

                </div>
                <TodaysFeedingsComponent />
            </div>
        </>
    )
};

export default DashboardPage;