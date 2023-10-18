import PocketBase, { Record } from 'pocketbase';
import { useState, useEffect } from 'react';
import getConfig from 'next/config';
import { IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import RackCell from '@/components/rack/RackCell';
import Link from 'next/link';
import InteractiveRack from '@/components/rack/InteractiveRack';
import Breadcrumbs from '@/components/Breadcrumbs';

const RacksIndexPage = () => {

    const [racks, setRacks] = useState<Array<Record>>([]);

    const VIEW_MODES = [
        { mode: 'list', label: 'Default' },
        { mode: 'vertical', label: 'Vertical' },
        { mode: 'table', label: 'Table' }
    ];

    const [viewMode, setViewMode] = useState<{ mode: string, label: string }>(VIEW_MODES[0]);

    const calculateEmptySlots = (rack: Record) => {
        return rack.columns * rack.rows - (
            rack.expand['rack_assignment(rack)'] ? (
                rack.expand['rack_assignment(rack)'].length + rack.expand['rack_assignment(rack)'].reduce(
                    (acc: number, assignment: Record) => acc + (assignment.colspan > 0 ? assignment.colspan - 1 : 0), 0) // add multi-column to reduction
            ) : 0);
    }

    const generateEmptySlotBadge = (rack: Record) => {
        const emptySlots = calculateEmptySlots(rack);

        if (emptySlots <= 0) {
            return <span className='badge badge-error'>{emptySlots}</span>;
        } else if (emptySlots < (rack.columns * rack.rows * 0.2)) { // < 20%
            return <span className='badge badge-warning'>{emptySlots}</span>;
        } else {
            return <span className='badge badge-success'>{emptySlots}</span>;
        }
    }

    useEffect(() => {
        const pb = new PocketBase(getConfig().publicRuntimeConfig.pocketbase);

        const fetchRacks = async () => {
            const racksRes = await pb.collection('rack').getFullList({ expand: 'rack_assignment(rack).animal.species' });
            setRacks(racksRes);
        }
        fetchRacks();
    }, []);

    return (
        <div>
            <Breadcrumbs />
            <div className='my-3 flex justify-end'>
                <div className='join'>
                    {VIEW_MODES.map((item) => (
                        <input key={item.mode} className="join-item btn btn-sm" checked={viewMode.mode === item.mode} type="radio" name="viewMode" aria-label={item.label} onClick={() => setViewMode(item)} />
                    ))}
                </div>
            </div>
            {viewMode.mode == 'table' ? (
                <div>
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th className='w-24'>Empty slots</th>
                                <th className='w-24'>Temperature</th>
                                <th className='w-64 text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {racks && racks.map((rack) => (
                                <tr key={rack.id}>
                                    <td>{rack.name}</td>
                                    <td className='text-center'>
                                        {generateEmptySlotBadge(rack)}
                                    </td>
                                    <td className='text-right'>30°C</td>
                                    <td className='text-right'>
                                        <span className="btn btn-sm btn-primary mr-2">View <IconEye size={16} /></span>
                                        <span className="btn btn-sm btn-secondary">Edit <IconPencil size={16} /></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={`flex ${viewMode.mode == 'vertical' ? 'flex-col' : 'flex-wrap'} items-start`}>
                    {racks && racks.map((item) => (
                        <InteractiveRack key={item.id} rack={item} />
                    ))}
                </div>
            )}

        </div>
    );
}

export default RacksIndexPage;