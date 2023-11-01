import TextField from '@/components/inputs/TextField';
import { useState } from 'react';
import Select, { SelectValue } from '@/components/inputs/SelectField';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import { IconExclamationCircle, IconSettingsAutomation, IconBell, IconReload } from '@tabler/icons-react';

import DatePickerComponent from '@/components/Datepicker';
import NumberField from '@/components/inputs/NumberField';
import MultiSelectField from '@/components/inputs/MultiSelectField';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateShorkBytesIdentityCode } from '@/helpers/animalCode';
import useNotification from '@/hooks/useNotification';

type SpeciesRecord = Record & { expand: { classification: Record } };

const AnimalsAddPage = () => {

    const { addNotification } = useNotification();
    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();

    const [progressStep, setStep] = useState(1);
    const STEPS = [
        { label: 'Basics', step: 1 },
        { label: 'Select Morphs', step: 2 },
        { label: 'Feeding', step: 3 },
        //{ label: 'Breeder Info', step: 4 },
        { label: 'Finish', step: 4 },
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
    const [code, setCode] = useState<string | null>(null);

    const [morphs, setMorphs] = useState<Array<SelectValue> | undefined>([]);

    const [feeder, setFeeder] = useState<SelectValue | undefined>(undefined);
    const [feedingAmount, setFeedingAmount] = useState<number | undefined>(1);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [speciesClassification, setSpeciesClassification] = useState<Array<SpeciesRecord>>([]);

    const [speciesList, setSpeciesList] = useState<Array<SelectValue>>([]);
    const [feedersList, setFeedersList] = useState<Array<SelectValue>>([]);
    const [morphList, setMorphList] = useState<Array<SelectValue>>([]);
    const [readyFinish, setReadyFinish] = useState(false);

    const [autoFeedSetup, setAutoFeedSetup] = useState(false);

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }

        const fetchFeeders = async () => {
            try {
                const feeders = await pb.collection('feeder_animal').getFullList();
                setFeedersList(feeders.map((item) => ({ value: item.id, label: item.name })));
            } catch (err) {
                console.log(err);
            }
        };

        const fetchSpecies = async () => {
            try {
                const res = await pb.collection('species').getFullList<SpeciesRecord>({ expand: 'classification' });
                setSpeciesList(res.map((item) => ({ value: item.id, label: `${item.common_name} (${item.latin_name})` })));
                setSpeciesClassification(res);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchMorphs = async () => {
            try {
                const res = await pb.collection('morph').getFullList();
                setMorphList(res.map((item) => ({ value: item.id, label: item.name })));
            } catch (err) {
                console.log(err);
            }
        };
        if (router.isReady) {
            fetchSpecies();
            fetchFeeders();
            fetchMorphs();
        }
    }, [router.isReady]);

    // allow finish
    useEffect(() => {
        if (species && (name || code)) {
            setReadyFinish(true);
        } else {
            setReadyFinish(false);
        }
    }, [species, code, name]);

    const handleSBCodeGeneration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!species || !speciesClassification) {
            addNotification('Please set a species for the new animal.', 'error');
            setStep(STEPS[0].step)
            return;
        }
        const speciesRecord = speciesClassification.find((s) => s.id === species.value);
        if (!speciesRecord) return;
        const animalCode = generateShorkBytesIdentityCode(speciesRecord.expand.classification.latin_name, speciesRecord.latin_name, sex, birthdate);
        setCode(animalCode);
        addNotification('Animal code generated.', 'success');
    }

    const handleAnimalCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!species) {
            addNotification('Please set a species for the new animal.', 'error');
            setStep(STEPS[0].step)
            return;
        }
        try {
            const pb = new PocketBase(publicRuntimeConfig.pocketbase);

            if (code) {
                const codeExists = await pb.collection('animal').getList(1, 1, { filter: `code = "${code}"` });
                console.log(codeExists);
                if (codeExists.items.length > 0) {
                    addNotification('This animal code already exists.', 'error');
                    setStep(STEPS[0].step)
                    return;
                }
            }

            const res = await pb.collection('animal').create({
                name,
                species: species.value,
                sex,
                code,
                birthday: birthdate,
                owner: pb.authStore.model?.id,
                default_food_feeder: autoFeedSetup && feedingAmount && feeder ? feeder.value : null,
                default_food_amount: autoFeedSetup && feedingAmount && feeder ? feedingAmount : null,
                morph: morphs && morphs.length > 0 ? morphs.map((item) => item.value) : null,
            });

            setStep([...STEPS].reverse()[0].step);
            addNotification('Animal has been created.', 'success');
            router.push(`/animals/${res.id}`);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
            <Breadcrumbs dynamicEntityName={{ 'add': 'Add Animal' }} />
            <div className='my-3'>
                {error && <div className="alert alert-error mb-8">
                    <IconExclamationCircle size={24} className="inline" />
                    <span>{error}</span>
                </div>}
                <h1 className='text-3xl'>Add Animal</h1>
                <ul className="steps steps-vertical lg:steps-horizontal w-full my-10">
                    {STEPS.map(({ step, label }) => (
                        <li key={step} className={`step cursor-pointer ${progressStep >= step ? 'step-primary' : ''}`} onClick={() => {

                            // avoid clicking finish step
                            if (step === STEPS.length) return;
                            setStep(step)
                        }
                        }>{label}</li>
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
                            <div className="form-control w-full p-2">
                                <label className="label">
                                    <span className="label-text" aria-label="Code">Code</span>
                                </label>
                                <div className="join">
                                    <input type="text" onChange={(e) => setCode(e.target.value)} className="input input-bordered w-full join-item" value={code || ''} />
                                    <button className="btn join-item btn-primary btn-square" onClick={handleSBCodeGeneration}><IconReload size={24} /></button>
                                </div>
                            </div>
                        </>
                    )}
                    {progressStep == 2 && (
                        <>
                            <h2 className='text-2xl text-center mb-8'>{STEPS[progressStep - 1].label}</h2>
                            <MultiSelectField label='Morphs' onChange={setMorphs} options={morphList} defaultValue={morphs} />
                        </>
                    )}
                    {progressStep == 3 && (
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

                        </>
                    )}
                    {progressStep == 4 && (
                        <>
                            <h2 className='text-2xl'>{STEPS[progressStep - 1].label}</h2>
                            {success}
                        </>
                    )}

                </div>
                {!success && (
                    <div className='mt-12 flex flex-row w-full lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto'>
                        <button className={`btn btn-primary ${progressStep === 1 ? 'btn-disabled' : ''}`} onClick={() => setStep(progressStep - 1)}>Back</button>
                        <div className='flex-grow'></div>
                        <button className={`ml-2 btn btn-primary ${progressStep === STEPS.length - 1 ? 'btn-disabled' : ''}`} onClick={() => setStep(progressStep + 1)}>Next</button>
                        <button className={`ml-2 btn btn-primary ${!readyFinish && 'btn-disabled'}`} onClick={handleAnimalCreation}>Finish</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AnimalsAddPage;