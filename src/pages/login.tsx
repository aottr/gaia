import Login from '@/components/auth/Login';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PocketBase from 'pocketbase';
import getConfig from 'next/config';

export default () => {

    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (pb.authStore.isValid) {
            router.push('/');
        }
    }, []);
    return (
        <Login />
    )
}