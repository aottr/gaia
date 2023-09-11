'use client'
import { useState } from 'react';
import { useRouter } from 'next/router';
import PocketBase from 'pocketbase';
import { IconExclamationCircle } from '@tabler/icons-react';
import getConfig from 'next/config';

const Login = () => {

    const { publicRuntimeConfig } = getConfig();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const handleLogin = async (e: any) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const pb = new PocketBase(process.env.POCKETBASE_HOST);
            const user = await pb.collection('users').authWithPassword(username, password);

            if (user) {
                router.reload();
            }

        } catch (error) {
            setError('Invalid Username or password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>

            <div className="flex flex-col max-w-md mx-auto mt-20">
                {error && <div className="alert alert-error mb-8">
                    <IconExclamationCircle size={24} className="inline" />
                    <span>{error}</span>
                </div>}

                <form onSubmit={handleLogin}>
                    <input type="text" name='username' placeholder="Username" className="input input-bordered input-primary input-lg w-full mb-4" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" name='password' placeholder="Password" className="input input-bordered input-primary input-lg w-full mb-4" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="btn btn-outline btn-secondary w-full btn-lg" disabled={loading}>
                        {loading && <span className="loading loading-spinner"></span>}
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;