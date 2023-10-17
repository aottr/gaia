
const InteractiveRack = ({ cols, rows, title, highlightedPosition, positionIsBlocked }: { cols: number, rows: number, title?: string, highlightedPosition?: number, positionIsBlocked?: boolean }) => {

    return (
        <div className='w-full bg-base-200 rounded-xl p-2'>
            <table className='w-full'>
                {title && (<thead>
                    <tr><th colSpan={cols} className='pb-2'>{title}</th></tr>
                </thead>)}
                <tbody>
                    {Array(rows).fill(0).map((_, i) => (
                        <tr key={`row-${i}`}>
                            {Array(cols).fill(0).map((_, j) => (
                                <td key={`cell-${i * cols + j}`}>
                                    <div className={`${highlightedPosition && (i * cols + j === highlightedPosition) ? (positionIsBlocked ? 'bg-error' : 'bg-primary') : 'bg-base-100'} rounded m-1`}>&nbsp;</div>
                                </td>
                            ))}
                        </tr>))}
                </tbody>
            </table>
        </div>
    );
}

export default InteractiveRack;