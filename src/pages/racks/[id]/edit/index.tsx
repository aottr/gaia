import TextField from '@/components/inputs/TextField';
import ShowcaseRack from '@/components/rack/ShowcaseRack';
import { useEffect, useState } from 'react';
import PocketBase, { Record } from 'pocketbase';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { IconArrowBackUp, IconAlertTriangle } from '@tabler/icons-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const DynamicRackEditPage = () => {

    const [cols, setCols] = useState(1);
    const [rows, setRows] = useState(1);
    const [title, setTitle] = useState('');
    const [rack, setRack] = useState<Record | undefined>(undefined);

    const [loading, setLoading] = useState(false);

    const MAX_ROWS = 10;
    const MAX_COLS = 10;

    const router = useRouter();

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);
        const getRack = async () => {
            try {
                const res = await pb.collection('rack').getOne(`${router.query.id}`);
                setRack(res);
                setCols(res.columns);
                setRows(res.rows);
                setTitle(res.name);
            } catch (err) {
                console.log(err);
            }
        }
        if (router.isReady && router.query.id) {
            getRack();
        }
    }, [router.isReady]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!rack) return;
        try {
            const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

            if (rack.columns !== cols || rack.rows !== rows) {
                const assignments = await pb.collection('rack_assignment').getFullList({
                    filter: `rack="${router.query.id}"`,
                });
                for (const assignment of assignments) {
                    await pb.collection('rack_assignment').delete(assignment.id);
                }
            }

            const res = await pb.collection('rack').update(`${router.query.id}`, {
                name: title,
                columns: cols,
                rows: rows,
            });
            router.push(`/racks/${res.id}`);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {rack && <Breadcrumbs dynamicEntityName={
                { [rack.id]: rack.name }
            } />}
            {rack && (rack.columns !== cols || rack.rows !== rows) && (
                <div className="alert alert-warning max-w-3xl mx-auto">
                    <IconAlertTriangle size={24} />
                    <span>Changing the size will remove all assignments</span>
                </div>
            )}
            <h1 className='text-2xl text-center my-8'>Edit Rack Assignment</h1>
            <div className='mx-auto flex justify-center'>

                <div className='flex flex-col justify-start items-center w-full max-w-sm'>
                    <TextField label="Title" value={title} onChange={setTitle} />
                    <div className='w-full px-2'>
                        <div className="form-control my-4">
                            <label className="label">
                                <span className="label-text">Amount of columns</span>
                            </label>
                            <input type="range" min={1} max={MAX_COLS} value={cols} className="range range-primary" step={1} onChange={(e) => setCols(Number(e.target.value))} />
                            <div className="w-full flex justify-between text-xs px-2">
                                {Array(MAX_COLS).fill(0).map((_, i) => (
                                    <div key={`cols-${i}`}>{i + 1}</div>
                                ))}
                            </div>
                        </div>
                        <div className="form-control my-4">
                            <label className="label">
                                <span className="label-text">Amount of rows</span>
                            </label>
                            <input type="range" min={1} max={MAX_ROWS} value={rows} className="range range-primary" step={1} onChange={(e) => setRows(Number(e.target.value))} />
                            <div className="w-full flex justify-between text-xs px-2">
                                {Array(MAX_ROWS).fill(0).map((_, i) => (
                                    <div key={`rows-${i}`}>{i + 1}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='w-full px-2'>
                        <button onClick={handleSave} type="submit" className={`btn btn-primary btn-lg w-full mt-4 mb-10`} disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : ''}
                            Save
                        </button>
                        <Link className="btn btn-primary btn-outline btn-lg w-full max-w-sm" href={`/racks`}>
                            <IconArrowBackUp size={24} />
                            Go Back
                        </Link>
                    </div>
                </div>
                <div className='flex flex-col justify-start items-center w-full max-w-sm px-3'>
                    <ShowcaseRack cols={cols} rows={rows} title={title} />
                </div>
            </div>
        </>
    );
}

export default DynamicRackEditPage;