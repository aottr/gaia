import Login from '@/components/auth/Login';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PocketBase from 'pocketbase';
import getConfig from 'next/config';

const LoginPage = () => {

    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();

    useEffect(() => {
        const pb = new PocketBase(process.env.POCKETBASE_HOST);

        if (pb.authStore.isValid) {
            router.push('/');
        }
    }, []);
    return (
        <Login />
    )
};

export default LoginPage;