import type { GetServerSidePropsContext } from "next";
import PocketBase from 'pocketbase';
import useSWR from 'swr';
import { useState } from 'react';
import getConfig from 'next/config'
import AnimalCard from '@/components/animal/AnimalCard';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';

const AnimalsIndex = () => {

    const { publicRuntimeConfig } = getConfig();

    const fetcher = () => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        return pb.collection("animal").getFullList(100, {
            sort: "name", expand: "species.classification,morph"
        }).then((res) => { return res; });
    }

    const [classification, setClassification] = useState(null);
    const { data, error, isLoading } = useSWR('animals', fetcher)
    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <>
            <div className='flex flex-row m-2'>
                <div className="join">
                    <Link href="/animals/add" className="btn btn-primary btn-sm">Add Animal <IconPlus size={16} /></Link>
                </div>
                <div className='flex-grow'></div>
                <div className="join">
                    {data && [...(data.map(item => ((item.expand.species as any).expand.classification as any).common_name))].filter((value, index, array) => array.indexOf(value) === index).map((classification) => (
                        <input key={classification} className="join-item btn btn-sm" type="radio" name="classification" aria-label={classification} onClick={() => setClassification(classification)} />
                    ))}
                    <input className="join-item btn btn-sm" type="radio" name="classification" aria-label="All" onChange={() => setClassification(null)} checked={!classification} />
                </div>
            </div>

            <div className='grid grid-cols-4 gap-4'>

            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                {!classification && data?.map((item) => (
                    <AnimalCard key={item.id} animal={item} />
                ))}
                {classification && data?.map((item) => (((item.expand.species as any).expand.classification as any).common_name === classification) && (
                    <AnimalCard key={item.id} animal={item} />
                ))}
            </div>
        </>
    )
}

export default AnimalsIndex;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {

    return {
        props: {}
    }
}