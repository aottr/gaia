import { IconScaleOutline, IconExclamationCircle, IconArrowBackUp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Datepicker from '@/components/Datepicker';
import PocketBase, { Record } from 'pocketbase';
import Link from 'next/link';
import getConfig from 'next/config';
import Breadcrumbs from '@/components/Breadcrumbs';

const DynamicAnimalAddWeight = () => {

    const { publicRuntimeConfig } = getConfig();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Date picker
    const [date, setDate] = useState<Date>(new Date());

    const [weight, setWeight] = useState('');
    const [animal, setAnimal] = useState<Record | null>(null);
    const router = useRouter();

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        const getAnimal = async () => {
            try {
                const animal = await pb.collection('animal').getOne(`${router.query.id}`, { expand: 'species' });
                setAnimal(animal);
            } catch (err) {
                router.push('/animals');
            }
        }
        if (router.isReady) {
            getAnimal();
        }
    }, [router.isReady]);

    const handleLogin = async (e: any) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (weight === '' || animal === null) {
                setError('Please enter a weight.');
                return;
            }

            setError('');

            const pb = new PocketBase(publicRuntimeConfig.pocketbase);
            const res = await pb.collection('weight').create({
                animal: animal?.id,
                value: weight,
                date: date,
            })

            if (res) {
                router.push(`/animals/${animal?.id}`);
            }

        } catch (error) {
            setError('Could not add weight. Try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {animal && <Breadcrumbs dynamicEntityName={{ [animal.id]: animal.name || animal.code || 'Animal', 'add': 'Add Weighing' }} />}
            {animal && (
                <form onSubmit={handleLogin}>
                    <div className='flex flex-col justify-center items-center'>
                        {error && <div className="alert alert-error mb-8 max-w-xs">
                            <IconExclamationCircle size={24} className="inline" />
                            <span>{error}</span>
                        </div>}
                        <h1 className='text-3xl mb-5 mt-10'> Weighing {animal.name ? animal.name : (animal.expand.species as any).common_name}</h1>
                        <div className="join max-w-xs mb-4">
                            <input type="number" min={0} tabIndex={0} placeholder="15.0" className="input input-bordered input-lg w-full join-item" value={weight} onChange={e => setWeight(e.target.value)} autoFocus={true} />
                            <span className='btn no-animation btn-lg bg-neutral border-neutral text-neutral-content hover:bg-neutral hover:border-neutral cursor-default join-item'>grams</span>
                        </div>
                        <div className='max-w-xs mb-4 w-full'>
                            <Datepicker onChange={date => setDate(date)} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-full max-w-xs mb-10" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : <IconScaleOutline size={24} />}
                            Add
                        </button>
                        <Link className="btn btn-primary btn-outline btn-lg w-full max-w-xs" href={`/animals/${animal.id}`}>
                            <IconArrowBackUp size={24} />
                            Go Back
                        </Link>
                    </div>
                </form>
            )}
        </>
    )
};

export default DynamicAnimalAddWeight;