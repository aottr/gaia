import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import InteractiveRack from '@/components/rack/InteractiveRack';
import Breadcrumbs from '@/components/Breadcrumbs';


const DynamicRackPage = () => {

    const [rack, setRack] = useState<Record | undefined>(undefined);

    const router = useRouter();

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const getRack = async () => {
            try {
                const res = await pb.collection('rack').getOne(`${router.query.id}`, { expand: 'rack_assignment(rack).animal.species' });
                setRack(res);
            } catch (err) {
                console.log(err);
            }
        }
        if (router.isReady && router.query.id) {
            getRack();
        }
    }, [router.isReady]);

    return (
        <>
            {rack && <Breadcrumbs dynamicEntityName={
                { [rack.id]: rack.name }
            } />}

            {rack && (
                <div className='mx-auto flex justify-center'>
                    <InteractiveRack rack={rack} />
                </div>
            )
            }
        </>
    );
}

export default DynamicRackPage;