import { useRouter } from 'next/router';
import Link from 'next/link';

const Breadcrumbs = ({ dynamicEntityName }: { dynamicEntityName?: { [key: string]: string } }) => {

    const router = useRouter();
    const pathSegments = router.asPath.split('/').filter(Boolean);

    const getLinkTitle = (segment: string) => {
        if (dynamicEntityName && dynamicEntityName[segment]) {
            return dynamicEntityName[segment];
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    return (
        <div className="text-sm breadcrumbs">
            <ul>
                {pathSegments.map((segment, i) => (
                    <li key={i}>
                        {i < pathSegments.length - 1 ? (
                            <Link className='text-primary' href={`/${pathSegments.slice(0, i + 1).join('/')}`}>
                                {getLinkTitle(segment)} </Link>
                        ) : (
                            <span>{getLinkTitle(segment)}</span>
                        )}

                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Breadcrumbs;