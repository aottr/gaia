'use client'
import { IconMenu, IconPlant } from '@tabler/icons-react';
import UserNav from './UserNav';
import PocketBase, { BaseAuthStore } from 'pocketbase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavItem from './NavItem';

const MENU_ITEMS = [
    {
        label: 'Test',
        href: '/test'
    },
    {
        label: 'Test',
        href: '/test1'
    },
    {
        label: 'Test',
        href: '/test2'
    }
]

export default () => {

    const [userData, setUserData] = useState<BaseAuthStore | null>(null);
    const router = useRouter();
    useEffect(() => {
        const pb = new PocketBase('http://localhost:8090');
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
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            {MENU_ITEMS.map((item) => (
                                <NavItem key={`mobile-${item.href}`} label={item.label} href={item.href} />
                            ))}
                        </ul>
                    </div>)}

                    <a className="btn btn-ghost normal-case text-xl">
                        <IconPlant size={24} className="inline" /> gaia</a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    {userData && (<ul className="menu menu-horizontal px-1">
                        {MENU_ITEMS.map((item) => (
                            <NavItem key={item.href} label={item.label} href={item.href} />
                        ))}
                    </ul>)}
                </div>
                <div className="navbar-end">
                    <UserNav userData={userData} setUserData={setUserData} />
                </div>
            </div>
        </div>
    )
}