import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PocketBase, { Record } from 'pocketbase';
import getConfig from 'next/config';
import Breadcrumbs from '@/components/Breadcrumbs';
import TextField from '@/components/inputs/TextField';
import SelectField, { SelectValue } from '@/components/inputs/SelectField';
import MultiSelectField from '@/components/inputs/MultiSelectField';
import DatePickerComponent from '@/components/Datepicker';
import useNotification from '@/hooks/useNotification';
import { generateShorkBytesIdentityCode } from '@/helpers/animalCode';
import { IconReload, IconArrowBackUp } from '@tabler/icons-react';

type AnimalRecord = Record & {};
type SpeciesRecord = Record & { expand: { classification: Record } };


const DynamicAnimalEditPage = () => {

    const router = useRouter();
    const { addNotification } = useNotification();
    const [animal, setAnimal] = useState<AnimalRecord | null>(null);
    const [speciesList, setSpeciesList] = useState<Array<SelectValue>>([]);
    const [morphList, setMorphList] = useState<Array<SelectValue>>([]);
    const [breederList, setBreederList] = useState<Array<SelectValue>>([]);
    const [feedersList, setFeedersList] = useState<Array<SelectValue>>([]);
    const [speciesClassification, setSpeciesClassification] = useState<Array<SpeciesRecord>>([]);

    const [name, setName] = useState<string | undefined>(undefined);
    const [species, setSpecies] = useState<SelectValue | undefined>(undefined);
    const [birthdate, setBirthdate] = useState<Date>(new Date());
    const [morphs, setMorphs] = useState<Array<SelectValue> | undefined>(undefined);
    const [sex, setSex] = useState<string>('u');
    const [code, setCode] = useState<string | null>(null);
    const [captiveBred, setCaptiveBred] = useState<boolean>(true);
    const [breeder, setBreeder] = useState<SelectValue | undefined>(undefined);

    const SEX = [
        { label: 'Male', value: 'm' },
        { label: 'Female', value: 'f' },
        { label: 'Unknown', value: 'u' },
    ];

    const handleSBCodeGeneration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!species || !speciesClassification) {
            addNotification('Please set a species for the new animal.', 'error');
            return;
        }
        const speciesRecord = speciesClassification.find((s) => s.id === species.value);
        if (!speciesRecord) return;
        const animalCode = generateShorkBytesIdentityCode(speciesRecord.expand.classification.latin_name, speciesRecord.latin_name, sex, birthdate);
        setCode(animalCode);
        addNotification('Animal code generated.', 'success');
    }

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const getAnimal = async () => {
            try {

                const animal = await pb.collection('animal').getOne<AnimalRecord>(router.query.id as string);
                setAnimal(animal);
                setName(animal.name);
                setSex(animal.sex);
                setCode(animal.code);
                setCaptiveBred(animal.captive_bred);
                if (animal.birthday) setBirthdate(new Date(animal.birthday));
            } catch (error) {
                console.error(error);
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

        const fetchFeeders = async () => {
            try {
                const feeders = await pb.collection('feeder_animal').getFullList();
                setFeedersList(feeders.map((item) => ({ value: item.id, label: item.name })));
            } catch (err) {
                console.log(err);
            }
        };

        const fetchBreeders = async () => {
            try {
                const breeders = await pb.collection('breeder').getFullList();
                setBreederList(breeders.map((item) => ({ value: item.id, label: `${item.name} [${item.country}]` })));

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

        if (router.isReady && router.query.id) {
            getAnimal();
            fetchSpecies();
            fetchFeeders();
            fetchMorphs();
            fetchBreeders();
        }
    }, [router.isReady]);

    if (!species && animal && speciesList.length > 0) {
        const speciesItem = speciesList.find((item) => item.value === animal.species);
        if (speciesItem) {
            setSpecies(speciesItem);
        }
    }

    if (!morphs && animal && morphList.length > 0) {
        const morphsItems = morphList.filter((item) => animal.morph.includes(item.value));
        console.log(morphsItems);
        if (morphsItems) {
            setMorphs(morphsItems);
        }
    }

    const handleBaseInformationUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code || !species || !name) {
            addNotification('Please fill out all required fields.', 'error');
            return;
        }
    }

    return animal && (
        <>
            <Breadcrumbs dynamicEntityName={{ [router.query.id as string]: animal.name || animal.code }} />
            <div className='my-3'>
                <div className='flex mb-4'>
                    <h1 className='text-3xl'>{animal.name || animal.code}</h1>
                    <div className='flex-grow'></div>
                    {(animal && animal.thumbnail) && (
                        <img
                            className='mt-10 md:w-16 md:mt-0 mx-auto md:mx-0 rounded-xl'
                            src={`${getConfig().publicRuntimeConfig.pocketbase}/api/files/animal/${animal.id}/${animal.thumbnail}?thumb=300x300`}
                            alt={`Picture of the author`}
                        />)}
                </div>
                <div className="card card-compact bg-base-200 shadow-xl z-10">
                    <div className="card-body">
                        <h2 className="card-title">Base information</h2>
                        <div className='grid md:grid-cols-2 gap-2'>
                            <TextField label='Name' value={name} onChange={setName} />
                            <div className="form-control w-full p-2">
                                <label className="label">
                                    <span className="label-text" aria-label="Code">Code</span>
                                </label>
                                <div className="join">
                                    <input type="text" onChange={(e) => setCode(e.target.value)} className="input input-bordered w-full join-item" value={code || ''} />
                                    <button className="btn join-item btn-primary btn-square" onClick={handleSBCodeGeneration}><IconReload size={24} /></button>
                                    <button className="btn join-item btn-error btn-square" onClick={() => setCode(animal.code)}><IconArrowBackUp size={24} /></button>
                                </div>
                            </div>
                            <SelectField label='Species' onChange={setSpecies} options={speciesList} value={species} />
                            <div className="form-control w-full p-2">
                                <label className="label">
                                    <span className="label-text">Date of Birth</span>
                                </label>
                                <DatePickerComponent onChange={date => setBirthdate(date)} defaultValue={animal.birthday && new Date(animal.birthday)} />
                            </div>
                            <MultiSelectField label='Morphs' onChange={setMorphs} options={morphList} value={morphs} />
                            <div className="form-control w-full p-2">
                                <label className="label">
                                    <span className="label-text">Sex</span>
                                </label>
                                <div className="join">
                                    {SEX.map((sexOption) => (
                                        <input key={sexOption.value} className="join-item btn btn-neutral" type="radio" name="options" aria-label={sexOption.label} value={sexOption.value} checked={sexOption.value === sex} onChange={(e) => setSex(sexOption.value)} />
                                    ))}
                                </div>
                            </div>
                            <div className="form-control w-full p-2 place-self-end">
                                <label className="cursor-pointer label">
                                    <span className="label-text text-xl">Captive Bred</span>
                                    <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={captiveBred} onChange={(e) => setCaptiveBred(e.target.checked)} />
                                </label>
                            </div>
                            <SelectField label='Breeder' onChange={setBreeder} options={breederList} value={breeder} isClearable={true} />
                        </div>
                        <div className='text-right m-2'>
                            <button className='btn btn-primary' onClick={handleBaseInformationUpdate}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DynamicAnimalEditPage;