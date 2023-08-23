'use client'
import { BaseAuthStore } from 'pocketbase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NavItem from './NavItem';

export default function UserNav({ userData, setUserData }: { userData: BaseAuthStore | null, setUserData: React.Dispatch<React.SetStateAction<BaseAuthStore | null>> }) {
    const router = useRouter();
    const logout = () => {
        userData?.clear();
        setUserData(null);
        router.reload();
    }


    return (
        <>
            {userData?.isValid && (
                <div className="ml-3 dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img src="https://cdn.pawb.social/mastodon-fe/accounts/avatars/110/310/480/052/439/630/original/1931b1ad3295ea9b.jpeg" />
                        </div>
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-neutral rounded-box w-52">
                        <NavItem label='Test' href='/test' />
                        <NavItem label='Test' href='/test' />
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