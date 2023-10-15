import TextField from '@/components/inputs/TextField';
import { useState } from 'react';
import Select, { SelectValue } from '@/components/inputs/SelectField';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { IconExclamationCircle, IconSettingsAutomation, IconBell } from '@tabler/icons-react';

import DatePickerComponent from '@/components/Datepicker';
import NumberField from '@/components/inputs/NumberField';

const AnimalsAddPage = () => {

    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();

    const [progressStep, setStep] = useState(1);
    const STEPS = [
        { label: 'Basics', step: 1 },
        //{ label: 'Morphs', step: 2 },
        { label: 'Feeding Info', step: 2 },
        //{ label: 'Breeder Info', step: 4 },
        { label: 'Finish', step: 3 },
    ];

    const SEX = [
        { label: 'Male', value: 'm' },
        { label: 'Female', value: 'f' },
        { label: 'Unknown', value: 'u' },
    ];

    const [name, setName] = useState<string | null>(null);
    const [species, setSpecies] = useState<SelectValue | undefined>(undefined);
    const [sex, setSex] = useState<string>('u');
    const [birthdate, setBirthdate] = useState<Date>(new Date());

    const [feeder, setFeeder] = useState<SelectValue | undefined>(undefined);
    const [feedingAmount, setFeedingAmount] = useState<number | undefined>(1);
    const [feedingInterval, setFeedingInterval] = useState<number | undefined>(7);

    const [error, setError] = useState<string | null>(null);
    const [speciesList, setSpeciesList] = useState<Array<SelectValue>>([]);
    const [feedersList, setFeedersList] = useState<Array<SelectValue>>([]);
    const [readyFinish, setReadyFinish] = useState(false);

    const [autoFeedSetup, setAutoFeedSetup] = useState(false);
    const [feedNotificationSetup, setFeedNotificationSetup] = useState(false);

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }

        const fetchFeeders = async () => {
            try {
                const feeders = await pb.collection('feeder_animal').getFullList();
                console.log(feeders);
                setFeedersList(feeders.map((item) => ({ value: item.id, label: item.name })));
            } catch (err) {
                console.log(err);
            }
        };

        const fetchSpecies = async () => {
            try {
                const res = await pb.collection('species').getFullList({ expand: 'species.classification' });
                console.log(res);
                setSpeciesList(res.map((item) => ({ value: item.id, label: `${item.common_name} (${item.latin_name})` })));
            } catch (err) {
                console.log(err);
            }
        };
        if (router.isReady) {
            fetchSpecies();
            fetchFeeders();
        }
    }, [router.isReady]);

    // allow finish
    useEffect(() => {
        if (species) {
            setReadyFinish(true);
        }
    }, [species]);

    const handleAnimalCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!species) {
            setError('Please set a species for the new animal.');
            setStep(STEPS[0].step)
            return;
        }
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        const res = await pb.collection('animal').create({
            name,
            species: species.value,
            sex,
            birthdate,
            owner: pb.authStore.model?.id,
            default_food_feeder: autoFeedSetup && feedingAmount && feeder ? feeder.value : null,
            default_food_amount: autoFeedSetup && feedingAmount && feeder ? feedingAmount : null,
        });

        if (feedNotificationSetup && feedingInterval) {
            await pb.collection('feeding_notification').create({
                animal: res.id,
                day_interval: feedingInterval,
            });
        }

        setStep(STEPS.toReversed()[0].step)
    }

    return (

        <div className='my-3 mx-4'>
            {error && <div className="alert alert-error mb-8">
                <IconExclamationCircle size={24} className="inline" />
                <span>{error}</span>
            </div>}
            <h1 className='text-3xl'>Add Animal</h1>
            <ul className="steps steps-vertical lg:steps-horizontal w-full my-10">
                {STEPS.map(({ step, label }) => (
                    <li key={step} className={`step cursor-pointer ${progressStep >= step ? 'step-primary' : ''}`} onClick={() => setStep(step)}>{label}</li>
                ))}
            </ul>

            <div className='w-full max-w-xl mx-auto'>
                {progressStep == 1 && (
                    <>
                        <h2 className='text-2xl text-center mb-8'>{STEPS[progressStep - 1].label}</h2>

                        <TextField label='Name' placeholder="Name" onChange={setName} />
                        <Select label='Species' onChange={setSpecies} options={speciesList} defaultValue={species} />
                        <div className="form-control w-full p-2">
                            <label className="label">
                                <span className="label-text">Sex</span>
                            </label>
                            <div className="join">
                                {SEX.map((sexOption) => (
                                    <input key={sexOption.value} className="join-item btn" type="radio" name="options" aria-label={sexOption.label} value={sexOption.value} checked={sexOption.value === sex} onChange={(e) => setSex(sexOption.value)} />
                                ))}
                            </div>
                        </div>
                        <div className="form-control w-full p-2">
                            <label className="label">
                                <span className="label-text">Date of Birth</span>
                            </label>
                            <DatePickerComponent onChange={date => setBirthdate(date)} />
                        </div>
                    </>
                )}
                {progressStep == 2 && (
                    <>
                        <h2 className='text-2xl text-center mb-8'>{STEPS[progressStep - 1].label}</h2>

                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">
                                    Set up Auto Feeding
                                    <IconSettingsAutomation size={24} className="inline text-primary ml-2" />
                                </span>
                                <input type="checkbox" className="toggle toggle-lg toggle-primary" onChange={(e) => setAutoFeedSetup(e.target.checked)} checked={autoFeedSetup} />
                            </label>
                        </div>
                        {
                            autoFeedSetup && (
                                <>
                                    <Select label='Feeder animal' onChange={setFeeder} options={feedersList} defaultValue={feeder} />
                                    <NumberField label='Feeding Amount' min={1} defaultValue={feedingAmount} placeholder="Feeding Amount" onChange={setFeedingAmount} />
                                </>
                            )
                        }

                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">
                                    Set up Feeding Notification
                                    <IconBell size={24} className="inline text-primary ml-2" />
                                </span>
                                <input type="checkbox" className="toggle toggle-lg toggle-primary" onChange={(e) => setFeedNotificationSetup(e.target.checked)} checked={feedNotificationSetup} />
                            </label>
                        </div>

                        {
                            feedNotificationSetup && (
                                <>
                                    <NumberField label='Feeding interval in days' min={1} defaultValue={feedingInterval} placeholder="Feeding interval in days" onChange={setFeedingInterval} />
                                </>
                            )
                        }
                    </>
                )}
                {progressStep == 3 && (
                    <>
                        <h2 className='text-2xl'>{STEPS[progressStep - 1].label}</h2>

                    </>
                )}

            </div>
            <div className='mt-12 flex flex-row w-full lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto'>
                <button className={`btn btn-primary ${progressStep === 1 ? 'btn-disabled' : ''}`} onClick={() => setStep(progressStep - 1)}>Back</button>
                <div className='flex-grow'></div>
                <button className="ml-2 btn btn-primary" onClick={() => setStep(progressStep + 1)}>Next</button>
                <button className={`ml-2 btn btn-primary ${!readyFinish && 'btn-disabled'}`} onClick={handleAnimalCreation}>Finish</button>
            </div>
        </div>
    );
};

export default AnimalsAddPage;