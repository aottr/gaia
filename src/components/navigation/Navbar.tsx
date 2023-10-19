'use client'
import { IconMenu, IconPlant, IconPaw, IconFileDescription, IconServer, IconDashboard } from '@tabler/icons-react';
import UserNav from './UserNav';
import PocketBase, { BaseAuthStore } from 'pocketbase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import Link from 'next/link';

const MENU_ITEMS = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: IconDashboard
    },
    {
        label: 'My Animals',
        href: '/animals',
        icon: IconPaw
    },
    {
        label: 'Library',
        href: '/species',
        icon: IconFileDescription
    },
    {
        label: 'Racks',
        href: '/racks',
        icon: IconServer
    }
]

const Navbar = () => {

    const [userData, setUserData] = useState<BaseAuthStore | null>(null);
    const { publicRuntimeConfig } = getConfig();
    const router = useRouter();

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        pb.authStore.model && setUserData(pb.authStore);
    }, []);

    return (
        <div className='border-b-4 border-primary'>
            <div className='container mx-auto navbar'>
                <div className="navbar-start">

                    {userData && (<div className="dropdown">
                        <label tabIndex={0} className="btn btn-ghost lg:hidden">
                            <IconMenu size={24} className="inline" />
                        </label>
                        <div tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            {MENU_ITEMS.map((item) => (
                                <Link key={`mobile-item-${item.label}`} href={item.href} className={`btn btn-ghost join-item ${router.pathname === item.href ? 'btn-active' : ''}`}>
                                    {item.icon && <item.icon size={24} className="inline" />} {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>)}

                    <a className="btn btn-ghost normal-case text-xl">
                        <IconPlant size={24} className="inline" /> gaia</a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    {userData && (<div className="px-1 join">
                        {MENU_ITEMS.map((item) => (
                            <Link key={item.label} href={item.href} className={`btn btn-ghost join-item ${router.pathname === item.href ? 'btn-active' : ''}`}>
                                {item.icon && <item.icon size={24} className="inline" />} {item.label}
                            </Link>
                        ))}
                    </div>)}
                </div>
                <div className="navbar-end">
                    <UserNav userData={userData} setUserData={setUserData} />
                </div>
            </div>
        </div>
    )
};

export default Navbar;