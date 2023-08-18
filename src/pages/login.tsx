import Login from '@/components/auth/Login';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PocketBase from 'pocketbase';

export default () => {

    const router = useRouter();


    useEffect(() => {
        const pb = new PocketBase('http://localhost:8090');

        if (pb.authStore.isValid) {
            router.push('/');
        }
    }, []);
    return (
        <Login />
    )
}