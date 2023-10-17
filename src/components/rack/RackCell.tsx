import { useState } from 'react';
import { IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import { Record } from 'pocketbase';
import Link from 'next/link';

const RackCell = ({ rack, assignment, position }: { rack: Record, assignment: Record | undefined, position: number }) => {

    const [checked, setChecked] = useState(false);
    const animal = assignment && assignment.expand && assignment.expand.animal as Record;
    console.log(animal);
    return (
        <div className='flex flex-row join p-1'>
            {assignment ? (assignment.animal && animal ? (
                <>
                    <div className={`btn ${checked ? 'btn-neutral' : 'btn-primary'} flex-grow join-item ${!checked && 'w-52'}`} onClick={() => setChecked(!checked)}>{checked ? 'Back' : animal?.name || (animal?.expand?.species as Record).latin_name}</div>
                    {checked && (
                        <>
                            <Link href={`/animals/${animal?.id}`} className='btn btn-primary join-item'><IconEye size={20} /></Link>
                            <Link href={`/racks/${rack.id}/edit/${position}`} className='btn btn-secondary join-item'><IconPencil size={20} /></Link>
                        </>
                    )}
                </>
            ) : assignment.blocked ? (
                <Link href={`/racks/${rack.id}/edit/${position}`} className="btn btn-error flex-grow">Blocked</Link>
            ) : (
                <div className="btn btn-neutral flex-grow">Unknown Animal</div>
            )
            ) : (
                <Link href={`/racks/${rack.id}/edit/${position}`} className="btn btn-secondary flex-grow">Empty</Link>
            )}

        </div>
    )
}

export default RackCell;