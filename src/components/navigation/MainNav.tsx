'use client'
import PocketBase, { BaseAuthStore } from 'pocketbase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getConfig from 'next/config'

export default function MainNav() {

    const { publicRuntimeConfig } = getConfig();
    const [userData, setUserData] = useState<BaseAuthStore | null>(null);
    const router = useRouter();
    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        pb.authStore.model && setUserData(pb.authStore);
    }, []);

    return userData?.isValid && (<span>Test</span>);
}