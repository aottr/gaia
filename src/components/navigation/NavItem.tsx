import Link from 'next/link';
import type { Icon } from '@tabler/icons-react';

export default ({ label, href, Icon }: { label: string, href: string, Icon?: Icon }) => (
    <li><Link href={href}>
        {Icon && <Icon size={24} className="inline" />} {label}
    </Link></li>
)