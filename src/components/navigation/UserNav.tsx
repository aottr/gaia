'use client'
import { BaseAuthStore } from 'pocketbase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconUser } from '@tabler/icons-react';
import getConfig from 'next/config';

export default function UserNav({ userData, setUserData }: { userData: BaseAuthStore | null, setUserData: React.Dispatch<React.SetStateAction<BaseAuthStore | null>> }) {
    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();
    const logout = () => {
        userData?.clear();
        setUserData(null);
        router.reload();
    }

    const avatarUrl = userData?.model?.avatar ? `${publicRuntimeConfig.pocketbase}/api/files/users/${userData?.model?.id}/${userData?.model?.avatar}` : null;
    console.log(avatarUrl);
    console.log(userData);
    return (
        <>
            {userData?.isValid && (
                <div className="ml-3 dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                        {avatarUrl && <div className="w-10 rounded-full">
                            <img src={avatarUrl} />
                        </div>}
                        {!avatarUrl && <IconUser size={26} />}
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-52">
                        <li><a onClick={logout}>Logout</a></li>
                    </ul>
                </div>
            )}

            {!userData && (
                <div className="ml-3 dropdown dropdown-end">
                    <Link className='btn btn-primary btn-outline' href='/login'>Login</Link>
                </div>
            )}

        </>
    )
}