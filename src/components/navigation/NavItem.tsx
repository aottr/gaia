import Link from 'next/link';
import type { Icon } from '@tabler/icons-react';
import { useRouter } from 'next/router';

const NavItem = ({ label, href, Icon }: { label: string, href: string, Icon?: Icon }) => {
    const router = useRouter();
    return (
        <li className={`btn btn-ghost join-item ${router.pathname === href ? 'btn-active' : ''}`}><Link href={href}>
            {Icon && <Icon size={24} className="inline" />} {label}
        </Link></li>
    )
};

export default NavItem;