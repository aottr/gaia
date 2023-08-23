import Footer from './Footer';
import Navbar from './navigation/Navbar';
import Head from 'next/head';

export default ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Head>
                <title>gaia</title>
            </Head>
            <div className="flex flex-col h-screen justify-between">
                <Navbar />
                <main className='flex-1 container mx-auto p-4'>{children}</main>
                <Footer />
            </div>
        </>
    )
}