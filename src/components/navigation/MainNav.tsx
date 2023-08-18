'use client'
import PocketBase, { BaseAuthStore } from 'pocketbase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavItem from './NavItem';

export default function MainNav() {

    const [userData, setUserData] = useState<BaseAuthStore | null>(null);
    const router = useRouter();
    useEffect(() => {
        const pb = new PocketBase('http://localhost:8090');
        pb.authStore.model && setUserData(pb.authStore);
    }, []);

    return userData?.isValid && (<span>Test</span>);
}