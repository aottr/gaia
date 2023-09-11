import { useState, useEffect } from 'react';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { useQRCode } from 'next-qrcode';
import { IconBug, IconScaleOutline, IconExclamationCircle, IconCircleCheck } from '@tabler/icons-react';
import WeightDiagram from '@/components/animal/charts/WeightDiagram';
import Link from 'next/link';
import getConfig from 'next/config';
import FeedingTimes from '@/components/animal/charts/FeedingTimes';
import Image from 'next/image'

const DynamicAnimalIndex = () => {
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
                const res = await pb.collection('animal').getOne(`${router.query.id}`, { expand: 'species.classification,weight(animal),feeding(animal)' });
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
            <h2 className='text-xs text-secondary'>Code: <a href={`/code/${animal.code}`} target='_blank'>{animal.code}</a></h2>
            <div className='flex flex-col md:flex-row w-full justify-between mt-6'>
                {(animal && animal.thumbnail) ? (
                    <img
                        className='mt-10 md:w-80 md:mt-0 mx-auto md:mx-0 rounded-xl'
                        src={`${publicRuntimeConfig.pocketbase}/api/files/animal/${animal.id}/${animal.thumbnail}?thumb=300x300`}
                        alt="Picture of the author"
                    />) : <div></div>}
                <div className='order-first md:order-none flex flex-row w-full justify-center mt-6 md:mt-0 md:w-auto md:justify-end'>
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
            </div>
            {
                (animal && animal.expand['weight(animal)']) && (
                    <>
                        <h2 className='text-2xl mt-10 mb-5'>Weight</h2>
                        <WeightDiagram weightData={animal ? animal.expand['weight(animal)'] : null} />

                    </>
                )
            }
            {(animal && animal.expand['feeding(animal)']) && (
                <>
                    <h2 className='text-2xl mt-10 mb-5'>Feeding</h2>
                    <FeedingTimes feedingData={animal ? animal.expand['feeding(animal)'] : null} />
                </>
            )
            }
            <h3 className='text-xl mb-5'>Defaults</h3>

            {animal.documents && animal.documents.length > 0 && (
                <>
                    <h2 className='text-2xl mt-10 mb-5'>Documents</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th className='w-40'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {animal.documents.map((doc: any, i: number) => (
                                <tr key={i}>
                                    <td className='break-all'>{doc}</td>
                                    <td className='w-40 text-right'>
                                        <Link href={`${publicRuntimeConfig.pocketbase}/api/files/animal/${animal.id}/${doc}`} target='_blanc' className="btn btn-primary btn-sm">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}



            {/*
                animal.code && (
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
                )
                    */}
        </div >
    ));
};

export default DynamicAnimalIndex;