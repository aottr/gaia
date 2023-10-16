import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import SelectField, { SelectValue } from '@/components/inputs/SelectField';
import Link from 'next/link';
import { IconArrowBackUp } from '@tabler/icons-react';

const DynamicRackEditPage = () => {

    const router = useRouter();

    const [animalList, setAnimalList] = useState<Array<SelectValue>>([]);
    const [animal, setAnimal] = useState<SelectValue | undefined>(undefined);
    const [assignment, setAssignment] = useState<Record | undefined>(undefined);
    const [rack, setRack] = useState<Record | undefined>(undefined);
    const [clearAssignment, setClearAssignment] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

        const getAnimals = async () => {
            try {
                const res = await pb.collection('animal').getFullList({ expand: 'species' });
                setAnimalList(res.map((animal) => ({ value: animal.id, label: animal.name || (animal.expand.species as Record).common_name })));
            } catch (err) {
                console.log(err);
            }
        }

        const getRack = async () => {
            try {
                const res = await pb.collection('rack').getOne(`${router.query.id}`);
                setRack(res);
            } catch (err) {
                console.log(err);
            }
        }

        const getAssignment = async () => {
            try {
                const res = await pb.collection('rack_assignment').getFirstListItem(`rack="${router.query.id}" && position="${router.query.position}"`);
                setAssignment(res);
            } catch (err) {
                console.log(err);
            }
        }
        getAnimals();
        getAssignment();
        getRack();
    }, [router.isReady]);

    if (assignment && assignment.animal && animalList.length > 0 && !animal) {
        setAnimal(animalList.find((a) => a.value === assignment.animal));
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

            if (assignment && clearAssignment) {
                await pb.collection('rack_assignment').delete(assignment.id);
                await router.push(`/racks`);
                return;
            }

            // fetch all assignments with chosen animal
            const assignments = await pb.collection('rack_assignment').getFullList({
                filter: `animal="${animal?.value}"`,
            });
            for (const animalAssignment of assignments) {

                if (assignment && animalAssignment.id === assignment.id) continue;
                await pb.collection('rack_assignment').delete(animalAssignment.id);
            }

            if (!assignment) {
                await pb.collection('rack_assignment').create({
                    rack: router.query.id,
                    animal: animal?.value,
                    position: router.query.position,
                });
            } else {
                await pb.collection('rack_assignment').update(assignment.id, {
                    animal: animal?.value,
                    position: router.query.position,
                });
            }
            await router.push(`/racks`);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    return (
        <div className='flex flex-col justify-center items-center max-w-sm mx-auto'>
            <h1 className='text-2xl text-center mb-8'>{assignment ? 'Edit' : 'Create'} Rack Assignment</h1>

            <div className='w-full px-2'>
                {rack && router.query.position && (<div className='w-full bg-base-200 rounded-xl p-2'>
                    <table className='w-full'>
                        <thead>
                            <tr><th colSpan={rack.columns} className='pb-2'>{rack.name}</th></tr>
                        </thead>
                        <tbody>
                            {Array(rack.rows).fill(0).map((_, i) => (
                                <tr key={`row-${i}`}>
                                    {Array(rack.columns).fill(0).map((_, j) => (
                                        <td key={`cell-${i * rack.columns + j}`}>
                                            <div className={`${i * rack.columns + j === Number(router.query.position) ? 'bg-primary' : 'bg-base-100'} rounded m-1`}>&nbsp;</div>
                                        </td>
                                    ))}
                                </tr>))}
                        </tbody>
                    </table>
                </div>)}
            </div>

            {!clearAssignment && (
                <SelectField
                    label=""
                    options={animalList}
                    onChange={setAnimal}
                    value={animal}
                    large={true}
                />
            )}
            {assignment && (
                <div className="form-control w-full p-2">
                    <label className="cursor-pointer label">
                        <span className="label-text">Clear rack assignment</span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={clearAssignment} onChange={() => setClearAssignment(!clearAssignment)} />
                    </label>
                </div>
            )}
            <div className='w-full px-2'>
                <button onClick={handleSave} type="submit" className={`btn ${clearAssignment ? 'btn-error' : 'btn-primary'} btn-lg w-full mt-4 mb-10`} disabled={loading}>
                    {loading ? <span className="loading loading-spinner"></span> : ''}
                    {clearAssignment ? 'Clear' : 'Save'}
                </button>
                <Link className="btn btn-primary btn-outline btn-lg w-full max-w-sm" href={`/racks`}>
                    <IconArrowBackUp size={24} />
                    Go Back
                </Link>
            </div>
        </div>
    );
}

export default DynamicRackEditPage;