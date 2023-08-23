import { useState, useEffect } from 'react';
import { IconExclamationCircle, IconArrowBackUp } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import Link from 'next/link';

export default () => {
    const { publicRuntimeConfig } = getConfig();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [feeders, setFeeders] = useState(Array<Record>);
    const [animal, setAnimal] = useState<Record | null>(null);
    const [feeder, setFeeder] = useState<string | null>(null);
    const [refused, setRefused] = useState(false);
    const [amount, setAmount] = useState('1');
    const [error, setError] = useState('');

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        const getFeeders = async () => {
            try {
                const feeders = await pb.collection('feeder_animal').getFullList();
                setFeeders(feeders);
            } catch (err) {
                console.log(err);
            }
        };
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
        getFeeders();
    }, [router.isReady]);

    const handleFeeding = async (e: any) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (amount === '') {
                setError('Please enter an amount.');
                return;
            }

            if (feeders.find((f) => f.id !== feeder) && !refused) {
                setError('Please select a feeder.');
                return;
            }

            setError('');

            const pb = new PocketBase(publicRuntimeConfig.pocketbase);
            const res = await pb.collection('feeding').create({
                animal: animal?.id,
                food: !refused ? feeder : null,
                amount: !refused ? amount : '0',
                refused
            })

            if (res) {
                router.push(`/animals/${animal?.id}`);
            }

        } catch (error) {
            setError(`${error}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleFeeding}>
                <div className='flex flex-col justify-center items-center'>
                    {error && <div className="alert alert-error mb-8 max-w-xs">
                        <IconExclamationCircle size={24} className="inline" />
                        <span>{error}</span>
                    </div>}
                    <select className="select select-bordered select-lg w-full max-w-xs mb-4" onChange={(e) => setFeeder(e.target.value)} defaultValue={-1}>
                        <option value={-1}>What feeder?</option>
                        {feeders.map((feeder) => <option key={feeder.id} value={feeder.id}>{feeder.name}</option>)}
                    </select>
                    {/*<input type="text" placeholder="Custom feeder" className="input input-bordered input-lg w-full max-w-xs mb-4" autoFocus={true} />*/}
                    <input type="number" placeholder="Amount" className="input input-bordered input-lg w-full max-w-xs mb-4" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus={true} />

                    <div className="form-control w-full max-w-xs mb-10">
                        <label className="cursor-pointer label">
                            <span className="label-text text-xl">Refused to eat</span>
                            <input type="checkbox" className="toggle toggle-primary toggle-lg" onChange={(e) => setRefused(e.target.checked)} />
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-full max-w-xs mb-10" disabled={loading}>
                        {loading ? <span className="loading loading-spinner"></span> : ''}
                        Add
                    </button>
                    <Link className="btn btn-primary btn-outline btn-lg w-full max-w-xs" href={`/animals/${animal?.id}`}>
                        <IconArrowBackUp size={24} />
                        Go Back
                    </Link>
                </div>
            </form>
        </>
    )
}