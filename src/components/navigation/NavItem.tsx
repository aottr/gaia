import Link from 'next/link';

export default ({ label, href }: { label: string, href: string }) => (
    <li><Link href={href}>
        {label}
    </Link></li>
)