import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import { IconExclamationCircle } from '@tabler/icons-react';
import PocketBase from 'pocketbase';
import getConfig from 'next/config';

const CodeRedirect = () => {

    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        const getAnimal = async () => {
            try {
                const animal = await pb.collection('animal').getFirstListItem(`code="${router.query.code}"`);
                router.push(`/animals/${animal.id}`);
            } catch (err) {
                setError(true);
            }
        }
        if (router.isReady) {
            getAnimal();
        }
    }, [router.isReady]);
    return (
        <div className='h-full w-full flex justify-center items-center'>
            {error ? <div className="w-56 h-56 flex flex-col justify-center items-center bg-error rounded-xl">
                <IconExclamationCircle size={60} />
                <span className='p-4'>Something went wrong.</span>
            </div> : <span className="loading loading-spinner text-secondary loading-lg"></span>}
        </div>
    )
}

export default CodeRedirect;