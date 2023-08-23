import { useState, useEffect } from 'react';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { useQRCode } from 'next-qrcode';
import { IconBug, IconScaleOutline, IconExclamationCircle, IconCircleCheck } from '@tabler/icons-react';
import WeightDiagram from '@/components/animal/charts/WeightDiagram';
import Link from 'next/link';
import getConfig from 'next/config';

export default () => {
    const router = useRouter();
    const { SVG } = useQRCode();
    const [animal, setAnimal] = useState<Record | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { publicRuntimeConfig } = getConfig();

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }
        const fetchAnimal = async () => {
            try {
                const res = await pb.collection('animal').getOne(`${router.query.id}`, { expand: 'species.classification,weight(animal)' });
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

    const tryAutoFeed = async () => {

        setError('');

        if (!animal?.default_food_feeder) {
            setError('There is no default feeder configured!');
            return;
        }
        try {
            const pb = new PocketBase(publicRuntimeConfig.pocketbase);
            const res = await pb.collection('feeding').create({
                animal: animal?.id,
                food: animal?.default_food_feeder,
                amount: animal?.default_food_amount == '0' ? 1 : animal?.default_food_amount,
            })

            if (res) {
                setSuccess(`Auto feeding successful!`);
            }

        } catch (err) {
            console.log(err);
        }
    };

    return (animal && (
        <div className='my-3'>
            {error && <div className="alert alert-error mb-8">
                <IconExclamationCircle size={24} className="inline" />
                <span>{error}</span>
            </div>}

            {success && <div className="alert alert-success mb-8">
                <IconCircleCheck size={24} className="inline" />
                <span>{success}</span>
            </div>}

            <h1 className='text-3xl'>{animal.name}</h1>

            <div className='flex flex-row w-full justify-center mt-6 md:mt-0 md:w-auto md:justify-end'>
                <div className="join">
                    <button className="btn join-item btn-primary" onClick={tryAutoFeed}>Auto Feed</button>
                    <Link className="btn join-item btn-primary btn-outline" href={`/animals/${animal.id}/feed/add`}>
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

            <dialog id="autoFeedNotConfigured" className="modal modal-bottom sm:modal-middle">
                <form method="dialog" className="modal-box">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    <h3 className="font-bold text-lg">Auto feed</h3>
                    <p className="py-4">There is no default feeder configured for this animal!</p>
                </form>
            </dialog>
        </div >
    ));

}