import { useState, useEffect } from 'react';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { useQRCode } from 'next-qrcode';
import { IconBug, IconScaleOutline, IconExclamationCircle, IconCircleCheck, IconBell, IconClipboardList, IconChartHistogram, IconSettingsAutomation } from '@tabler/icons-react';
import WeightDiagram from '@/components/animal/charts/WeightDiagram';
import Link from 'next/link';
import getConfig from 'next/config';
import FeedingTimes from '@/components/animal/charts/FeedingTimes';
import { autoFeeding } from '@/helpers/feeding';

import { isPast, addDays, differenceInDays } from 'date-fns';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReminderTable from '@/components/animal/ReminderTable';

const DynamicAnimalIndex = () => {

    const HISTORY_MINIMUM = 3;

    const router = useRouter();
    const { SVG } = useQRCode();
    const [animal, setAnimal] = useState<Record | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { publicRuntimeConfig } = getConfig();

    const getRackAssignment = (animal: Record): { id: string, position: number, name: string } | null => {
        if (!animal?.expand['rack_assignment(animal)'] || !(animal.expand['rack_assignment(animal)'] as Array<Record>)[0].expand.rack) {
            return null;
        }
        return {
            id: (animal.expand['rack_assignment(animal)'] as unknown as Array<Record>)[0].id,
            position: (animal.expand['rack_assignment(animal)'] as unknown as Array<Record>)[0].position,
            name: ((animal.expand['rack_assignment(animal)'] as Array<Record>)[0].expand.rack as Record).name
        }
    }

    const getLastFeeding = (animal: Record) => {
        if (!animal?.expand['feeding(animal)']) {
            return null;
        }
        const lastFeeding = [...(animal?.expand['feeding(animal)'] as unknown as Array<Record>)].sort((a: any, b: any) => (new Date(a.date).getTime() - new Date(b.date).getTime())).reverse()[0];
        return lastFeeding;
    }

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }
        const fetchAnimal = async () => {
            try {
                const res = await pb.collection('animal').getOne(`${router.query.id}`, { expand: 'species.classification,weight(animal),feeding(animal),default_food_feeder,rack_assignment(animal).rack' });
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

    const tryAutoFeed = async () => {

        if (!animal) return;
        setError('');
        if (!animal.default_food_feeder) {
            setError('There is no default feeder configured!');
            return;
        }

        if (await autoFeeding(animal)) setSuccess(`Auto feeding successful!`);
    };

    return (animal && (
        <>
            <Breadcrumbs dynamicEntityName={{ [animal.id]: animal.name || animal.code || 'Animal' }} />
            <div className='my-3'>
                {error && <div className="alert alert-error mb-8">
                    <IconExclamationCircle size={24} className="inline" />
                    <span>{error}</span>
                </div>}

                {success && <div className="alert alert-success mb-8">
                    <IconCircleCheck size={24} className="inline" />
                    <span>{success}</span>
                </div>}

                <h1 className='text-3xl'>
                    {animal.name}
                    <span className='btn btn-xs' onClick={() => router.push(`/animals/${animal.id}/edit`)}>Edit</span>
                </h1>
                <h2 className='text-xs text-secondary'>Code: {animal.code ? <a href={`/code/${animal.code}`} target='_blank'>{animal.code}</a> : (
                    <div className='ml-2 badge badge-error badge-sm'>Not configured</div>
                )}</h2>
                {getRackAssignment(animal) && (
                    <h2 className='text-sm text-primary'>Rack: {getRackAssignment(animal)?.name}</h2>
                )}
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

                <div className="card card-compact w-full bg-base-200 shadow-xl my-4">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-normal">
                            <span className='rounded-full bg-base-100 p-2'>
                                <IconBug size={20} className='text-primary' />
                            </span>
                            Feeding
                        </h2>
                        <div>
                            <h3 className="card-subtitle text-lg my-2 text-primary">Auto Feeding <IconSettingsAutomation size={20} className='inline' />
                                {(!animal?.default_food_feeder || !animal?.default_food_amount) && (<div className='ml-2 badge badge-error'>Not configured</div>)}
                            </h3>
                            {(animal?.default_food_feeder && animal?.default_food_amount) && (
                                <div className='mb-6'>
                                    Auto Feeding is configured with
                                    <div className='badge badge-primary badge-outline ml-1'>{animal?.default_food_amount}x</div>
                                    <div className='badge badge-primary badge-outline ml-1'>{(animal?.expand.default_food_feeder as unknown as { name: string }).name}</div>
                                </div>
                            )}
                            <h3 className="card-subtitle text-lg my-2 text-primary">Feeding history <IconChartHistogram size={20} className='inline' /></h3>
                            {(animal && animal.expand['feeding(animal)']) && (animal.expand['feeding(animal)']).length >= HISTORY_MINIMUM && (
                                <>
                                    <FeedingTimes feedingData={animal ? animal.expand['feeding(animal)'] : null} />
                                </>
                            )}

                            {(animal && (!animal.expand['feeding(animal)']) || (animal.expand['feeding(animal)']).length < HISTORY_MINIMUM) && (
                                <div>History will be generated after a minimum of <div className="badge badge-primary badge-outline">{HISTORY_MINIMUM}</div> feedings.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card card-compact w-full bg-base-200 shadow-xl my-4">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-normal">
                            <span className='rounded-full bg-base-100 p-2'>
                                <IconScaleOutline size={20} className='text-primary' />
                            </span>
                            Weight
                        </h2>
                        <div>
                            <h3 className="card-subtitle text-lg my-2 text-primary">Weight history <IconChartHistogram size={20} className='inline' /></h3>
                            {(animal && animal.expand['weight(animal)']) && (animal.expand['weight(animal)']).length >= HISTORY_MINIMUM && (
                                <>
                                    <WeightDiagram weightData={animal ? animal.expand['weight(animal)'] : null} />
                                </>
                            )}

                            {(animal && (!animal.expand['weight(animal)']) || (animal.expand['weight(animal)']).length < HISTORY_MINIMUM) && (
                                <div>History will be generated after a minimum of <div className="badge badge-primary badge-outline">{HISTORY_MINIMUM}</div> weightings.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card card-compact w-full bg-base-200 shadow-xl my-4">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-normal">
                            <span className='rounded-full bg-base-100 p-2'>
                                <IconBell size={20} className='text-primary' />
                            </span>
                            Reminders
                        </h2>
                        <div>
                            <ReminderTable animal={animal} />
                        </div>
                    </div>
                </div>

                <div className="card card-compact w-full bg-base-200 shadow-xl my-4">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-normal">
                            <span className='rounded-full bg-base-100 p-2'>
                                <IconClipboardList size={20} className='text-primary' />
                            </span>
                            Tasks
                        </h2>
                        <div>

                        </div>
                    </div>
                </div>

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
        </>
    ));
};

export default DynamicAnimalIndex;