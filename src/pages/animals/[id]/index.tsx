import { useState, useEffect } from 'react';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { useQRCode } from 'next-qrcode';
import { IconBug, IconScaleOutline, IconExclamationCircle, IconCircleCheck, IconDots, IconBell, IconAdjustmentsAlt, IconClipboardList, IconChartHistogram, IconSettingsAutomation, IconPoo, IconFiles } from '@tabler/icons-react';
import WeightDiagram from '@/components/animal/charts/WeightDiagram';
import Link from 'next/link';
import getConfig from 'next/config';
import FeedingTimes from '@/components/animal/charts/FeedingTimes';
import { autoFeeding } from '@/helpers/feeding';

import { isPast, addDays, differenceInMonths, format, differenceInYears } from 'date-fns';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReminderTable from '@/components/animal/ReminderTable';

const DynamicAnimalIndex = () => {

    const HISTORY_MINIMUM = 3;

    type Animal = Record & {
        expand: {
            species: Record,
            morph: Record[]
        }
    }

    const router = useRouter();
    const { SVG } = useQRCode();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { publicRuntimeConfig } = getConfig();

    const getRackAssignment = (animal: Animal): { id: string, position: number, name: string } | null => {
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
                const res = await pb.collection('animal').getOne<Animal>(`${router.query.id}`, { expand: 'species.classification,morph,weight(animal),feeding(animal),default_food_feeder,rack_assignment(animal).rack' });
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
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='relative'>
                    <div className='md:sticky top-0 pt-4'>
                        <h1 className='text-3xl'>
                            {animal.name}
                        </h1>
                        <h2 className='text-xs text-secondary'>Code: {animal.code ? <a href={`/code/${animal.code}`} target='_blank'>{animal.code}</a> : (
                            <div className='ml-2 badge badge-error badge-sm'>Not configured</div>
                        )}</h2>
                        {(animal && animal.thumbnail) ? (
                            <img
                                className='mt-10 w-56 md:w-80 md:mt-1 mx-auto md:mx-0 rounded-xl'
                                src={`${publicRuntimeConfig.pocketbase}/api/files/animal/${animal.id}/${animal.thumbnail}?thumb=300x300`}
                                alt="Picture of the author"
                            />) : <div></div>}
                        <div className="flex flex-col text-sm my-2">
                            <div className="flex">
                                <div className="flex-none p-1 font-bold">Species</div>
                                <div className="flex-grow p-1 italic text-right">
                                    <Link href={`/species/${animal.expand.species.id}`} className='badge badge-sm badge-primary'>
                                        {animal.expand.species.latin_name}
                                    </Link>
                                </div>
                            </div>
                            <div className="flex">
                                <div className="flex-none p-1 font-bold">Gender</div>
                                <div className="flex-grow p-1 text-right">{animal.sex == 'm' ? 'Male' : animal.sex == 'f' ? 'Female' : 'Unknown'}</div>
                            </div>
                            {animal.birthday && (<div className="flex">
                                <div className="flex-none p-1 font-bold">Birth</div>
                                <div className="flex-grow p-1 text-right">
                                    <div className="tooltip tooltip-bottom cursor-pointer" data-tip={format(new Date(animal.birthday), 'dd.MM.yyyy')}>
                                        {differenceInYears(new Date(), new Date(animal.birthday)) > 0 ? `${differenceInYears(new Date(), new Date(animal.birthday))}y` : ''} {differenceInMonths(new Date(), new Date(animal.birthday)) % 12}m
                                    </div>
                                    <div className='tooltip tooltip-bottom cursor-pointer' data-tip={animal.captive_bred ? 'Captive Bred' : 'Wild Caught'}>
                                        <div className={`badge badge-sm badge-${animal.captive_bred ? 'success' : 'warning'} ml-2`}>{animal.captive_bred ? 'CB' : 'WC'}</div>
                                    </div>
                                </div>
                            </div>)}
                            <div className="flex">
                                <div className="flex-none p-1 font-bold">Morph</div>
                                <div className="flex-grow p-1 text-right">
                                    {animal.expand.morph ? animal.expand.morph.map(
                                        (morph: Record, i: number) => (
                                            <span key={i} className='badge badge-sm badge-secondary ml-1'>
                                                {morph.name}
                                            </span>
                                        )
                                    ) : (
                                        <span className='badge badge-secondary badge-sm'>Wild</span>
                                    )}

                                </div>
                            </div>
                        </div>
                        {getRackAssignment(animal) && (
                            <h2 className='text-sm text-primary'>Rack: {getRackAssignment(animal)?.name}</h2>
                        )}
                    </div>
                </div>
                <div className='overflow-y-auto col-span-3'>
                    <div className='flex justify-end items-center'>
                        <div className='join'>
                            <div className="tooltip tooltip-bottom" data-tip="Feed Animal">
                                <span className='btn btn-outline btn-primary join-item' onClick={tryAutoFeed}><IconBug /></span>
                            </div>
                            <div className="tooltip tooltip-bottom" data-tip="Weight Animal">
                                <Link className='btn btn-outline btn-primary join-item' href={`/animals/${animal.id}/weight/add`}><IconScaleOutline size={24} /></Link>
                            </div>
                            <div className="tooltip tooltip-bottom" data-tip="Clean Animal">
                                <span className='btn btn-outline btn-primary join-item'><IconPoo size={24} /></span>
                            </div>
                        </div>
                        <details className="dropdown dropdown-end">
                            <summary className="m-1 btn btn-secondary"><IconDots size={24} /></summary>
                            <ul className="p-2 shadow menu menu-lg dropdown-content z-[1] bg-base-200 rounded-box w-52">
                                <li><Link className='' href={`/animals/${animal.id}/feed/add`}><IconBug size={24} /> Manual Feed</Link></li>
                                <li><Link href={`/animals/${animal.id}/edit`}><IconAdjustmentsAlt size={24} />Edit Animal</Link></li>
                            </ul>
                        </details>
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

                    <div className="card card-compact w-full bg-base-200 shadow-xl my-4">
                        <div className="card-body">
                            <h2 className="card-title text-2xl font-normal">
                                <span className='rounded-full bg-base-100 p-2'>
                                    <IconFiles size={20} className='text-primary' />
                                </span>
                                Documents
                            </h2>
                            <table className="table">
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    ));
};

export default DynamicAnimalIndex;