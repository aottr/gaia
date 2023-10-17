import PocketBase, { Record } from 'pocketbase';
import { useState, useEffect } from 'react';
import getConfig from 'next/config';
import { IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import RackCell from '@/components/rack/RackCell';

const RacksIndexPage = () => {

    const [racks, setRacks] = useState<Array<Record>>([]);

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
            <div className='flex flex-wrap items-start'>
                {racks && racks.map((item) => (
                    <div className='m-2 bg-base-200 rounded-xl p-3' key={item.id}>
                        <table>
                            <thead>
                                <tr><th colSpan={item.columns} className='pb-2'>{item.name}</th></tr>
                            </thead>
                            <tbody>
                                {Array(item.rows).fill(0).map((_, i) => {
                                    let skipCol = 0;
                                    return (<tr key={`row-${i}`}>
                                        {Array(item.columns).fill(0).map((_, j) => {
                                            if (--skipCol >= 0) return null;

                                            const assignment = item.expand['rack_assignment(rack)'] && (item.expand['rack_assignment(rack)'] as unknown as Array<Record>).find((assignment) => assignment.position == i * item.columns + j);
                                            if (assignment && assignment.colspan > 0) skipCol = assignment.colspan - 1;
                                            return (
                                                <td colSpan={assignment && assignment.colspan > 0 ? assignment.colspan : 1} className='w-56' key={`cell-${i * item.columns + j}`}>
                                                    <RackCell rack={item} assignment={assignment} position={i * item.columns + j} />
                                                </td>
                                            );
                                        })}
                                    </tr>)
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RacksIndexPage;