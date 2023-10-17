import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import getConfig from 'next/config';
import PocketBase, { Record } from 'pocketbase';
import SelectField, { SelectValue } from '@/components/inputs/SelectField';
import Link from 'next/link';
import { IconArrowBackUp, IconExclamationCircle } from '@tabler/icons-react';
import ShowcaseRack from '@/components/rack/ShowcaseRack';

const DynamicRackEditPage = () => {

    const router = useRouter();

    const [animalList, setAnimalList] = useState<Array<SelectValue>>([]);
    const [animal, setAnimal] = useState<SelectValue | undefined>(undefined);
    const [assignment, setAssignment] = useState<Record | undefined>(undefined);
    const [rack, setRack] = useState<Record | undefined>(undefined);

    const [colSpan, setColSpan] = useState(1);

    const [blockAssignment, setBlockAssignment] = useState(false);
    const [clearAssignment, setClearAssignment] = useState(false);
    const [multiColumns, setMultiColumns] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

                if (res.colspan > 0) {
                    setMultiColumns(true);
                    setColSpan(res.colspan);
                }
                setBlockAssignment(res.blocked);
            } catch (err) {
                //console.log(err);
            }
        }
        getAnimals();
        getAssignment();
        getRack();
    }, [router.isReady]);

    if (assignment && assignment.animal && animalList.length > 0 && !animal) {
        setAnimal(animalList.find((a) => a.value === assignment.animal));
    }

    const maxColSpan = rack && router.query.position ? rack.columns - (Number(router.query.position) % rack.columns) : 1;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

            if (!animal && !blockAssignment && !clearAssignment) {
                setError('Please select an animal');
                return;
            }

            if (assignment && clearAssignment) {
                await pb.collection('rack_assignment').delete(assignment.id);
                await router.push(`/racks`);
                return;
            }

            // remove possible assignments that would be overwritten
            if (colSpan > 1) {
                const hiddenAssignments = await pb.collection('rack_assignment').getFullList({
                    filter: `position > "${router.query.position}" && position < "${Number(router.query.position) + colSpan}"`,
                });
                for (const assignment of hiddenAssignments) {
                    await pb.collection('rack_assignment').delete(assignment.id);
                }
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
                    animal: blockAssignment ? null : animal?.value,
                    position: router.query.position,
                    colspan: colSpan > 1 ? colSpan : null,
                    blocked: blockAssignment,
                });
            } else {
                await pb.collection('rack_assignment').update(assignment.id, {
                    animal: blockAssignment ? null : animal?.value,
                    position: router.query.position,
                    colspan: colSpan > 1 ? colSpan : null,
                    blocked: blockAssignment,
                });
            }
            await router.push(`/racks`);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {error && <div className="alert alert-error mt-3 mb-8 mx-4">
                <IconExclamationCircle size={24} className="inline" />
                <span>{error}</span>
            </div>}
            <div className='flex flex-col justify-center items-center max-w-sm mx-auto'>
                <h1 className='text-2xl text-center mb-8'>{assignment ? 'Edit' : 'Create'} Rack Assignment</h1>

                <div className='w-full px-2 mb-4'>
                    {rack && router.query.position && (
                        <ShowcaseRack cols={rack.columns} rows={rack.rows} title={rack.name} highlightedPosition={Number(router.query.position)} positionIsBlocked={assignment && assignment.blocked} />
                    )}
                </div>

                <div className="form-control w-full p-2">
                    <label className="cursor-pointer label">
                        <span className="label-text">Set Multi Column</span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={multiColumns} onChange={() => setMultiColumns(!multiColumns)} />
                    </label>
                </div>

                <div className="form-control w-full p-2">
                    <label className="cursor-pointer label">
                        <span className="label-text">Block rack assignment</span>
                        <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={blockAssignment} onChange={() => setBlockAssignment(!blockAssignment)} />
                    </label>
                </div>

                {rack && router.query.position && multiColumns && maxColSpan > 1 && (
                    <div className='form-control w-full p-2'>
                        <input type="range"
                            min={1}
                            max={maxColSpan}
                            value={colSpan} onChange={(e) => setColSpan(Number(e.target.value))} className="range range-primary my-2" step={1} />
                        <div className="w-full flex justify-between text-xs px-2">
                            {Array(maxColSpan).fill(0).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                    </div>
                )}
                {multiColumns && maxColSpan <= 1 && (
                    <div className='px-2'>
                        <div className='alert alert-info'>
                            Please select another position with more space to the right.
                        </div>
                    </div>
                )}

                {!clearAssignment && !blockAssignment && (
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
        </>
    );
}

export default DynamicRackEditPage;