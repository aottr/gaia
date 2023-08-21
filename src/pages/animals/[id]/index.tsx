import { useState, useEffect } from 'react';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { useQRCode } from 'next-qrcode';
import { IconBug, IconScaleOutline } from '@tabler/icons-react';
import WeightDiagram from '@/components/animal/WeightDiagram';
import Link from 'next/link';
import getConfig from 'next/config';

export default () => {
    const router = useRouter();
    const { SVG } = useQRCode();
    const [animal, setAnimal] = useState<Record | null>(null);
    const { publicRuntimeConfig } = getConfig();

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }
        const fetchAnimal = async () => {
            try {
                const res = await pb.collection('animal').getOne(`${router.query.id}`, { expand: 'species.classification,weight(animal)' });
                console.log(res);
                setAnimal(res);
            } catch (err) {
                console.log(err);
                router.push('/species');
            }
        };
        if (router.isReady) {
            fetchAnimal();
        }
    }, [router.isReady]);

    return (animal && (
        <div className='my-3'>
            <h1 className='text-3xl'>{animal.name}</h1>

            <div className='flex flex-row w-full justify-center mt-6 md:mt-0 md:w-auto md:justify-end'>
                <div className="join">
                    <button className="btn join-item btn-primary">Auto Feed</button>
                    <Link className="btn join-item btn-primary btn-outline" href={`/animals/${animal.id}/feed`}>
                        <IconBug size={24} />
                        Feed
                    </Link>
                    <Link className="btn join-item btn-outline btn-secondary" href={`/animals/${animal.id}/weight/add`}>
                        <IconScaleOutline size={24} />
                        Weight
                    </Link>
                </div>
            </div>

            {
                (animal && animal.expand['weight(animal)']) && (
                    <>
                        <h2 className='text-2xl mt-10 mb-5'>Weight</h2>
                        <WeightDiagram weightData={animal ? animal.expand['weight(animal)'] : null} />
                    </>
                )
            }

            {animal.code && (
                <SVG
                    text={`http://localhost:3000/code/${animal.code}`}
                    options={{
                        margin: 3,
                        width: 200,
                        color: {
                            dark: '#000000',
                            light: '#ffffff',
                        },
                    }}
                />
            )}
        </div >
    ));

}