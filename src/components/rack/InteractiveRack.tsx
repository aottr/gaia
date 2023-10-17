import { Record } from 'pocketbase';
import RackCell from '@/components/rack/RackCell';
import Link from 'next/link';
import { IconEye, IconPencil } from '@tabler/icons-react';

const InteractiveRack = ({ rack }: { rack: Record }) => {

    return (
        <div className='m-2 bg-base-200 rounded-xl p-1' key={rack.id}>
            <table>
                <thead>
                    <tr><th colSpan={rack.columns} className='pb-1'>{rack.name}</th></tr>
                </thead>
                <tbody>
                    {Array(rack.rows).fill(0).map((_, i) => {
                        let skipCol = 0;
                        return (<tr key={`row-${i}`}>
                            {Array(rack.columns).fill(0).map((_, j) => {
                                if (--skipCol >= 0) return null;

                                const assignment = rack.expand['rack_assignment(rack)'] && (rack.expand['rack_assignment(rack)'] as unknown as Array<Record>).find((assignment) => assignment.position == i * rack.columns + j);
                                if (assignment && assignment.colspan > 0) skipCol = assignment.colspan - 1;
                                return (
                                    <td colSpan={assignment && assignment.colspan > 0 ? assignment.colspan : 1} className='w-56' key={`cell-${i * rack.columns + j}`}>
                                        <RackCell rack={rack} assignment={assignment} position={i * rack.columns + j} />
                                    </td>
                                );
                            })}
                        </tr>)
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={rack.columns} className='text-end pt-1 pr-1'>
                            <div className="tooltip tooltip-bottom" data-tip="Show rack">
                                <Link href={`/racks/${rack.id}`} className="btn btn-xs btn-primary btn-square mr-1"><IconEye size={16} /></Link>
                            </div>
                            <div className="tooltip tooltip-bottom" data-tip="Edit rack">
                                <Link href={`/racks/${rack.id}/edit`} className="btn btn-xs btn-secondary btn-square"><IconPencil size={16} /></Link>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default InteractiveRack;