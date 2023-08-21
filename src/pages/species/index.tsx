import initPocketBase from "@/helpers/initPocketbase";
import type { GetServerSidePropsContext } from "next";
import Link from 'next/link';
import PocketBase from 'pocketbase';
import useSWR from 'swr';
import { useState } from 'react';
import getConfig from 'next/config';

export default () => {

    const { publicRuntimeConfig } = getConfig();
    const fetcher = () => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        return pb.collection("species").getFullList(100, {
            sort: "latin_name", expand: "classification"
        }).then((res) => res);
    }

    const [classification, setClassification] = useState(null);
    const { data, error, isLoading } = useSWR('species', fetcher)

    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <>
            <div className='flex flex-row my-4 justify-end'>
                <div className="join">
                    {data && [...(data.map(item => (item.expand.classification as any).common_name))].filter((value, index, array) => array.indexOf(value) === index).map((classification) => (
                        <input className="join-item btn btn-sm" type="radio" name="classification" aria-label={classification} onClick={() => setClassification(classification)} />
                    ))}
                    <input className="join-item btn btn-sm" type="radio" name="classification" aria-label="All" onClick={() => setClassification(null)} checked={!classification} />
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Classification</th>
                        <th>Scientific name</th>
                        <th>Common name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {classification && data?.map((item) => ((item.expand.classification as any).common_name === classification) && (
                        <tr key={item.id}>
                            <td>{(item.expand?.classification as any).common_name}</td>
                            <td>{item.latin_name}</td>
                            <td>{item.common_name}</td>
                            <td className='text-right'><Link href={`/species/${item.id}`} className='btn btn-secondary btn-xs'>View</Link></td>
                        </tr>
                    ))}
                    {!classification && data?.map((item) => (
                        <tr key={item.id}>
                            <td>{(item.expand?.classification as any).common_name}</td>
                            <td>{item.latin_name}</td>
                            <td>{item.common_name}</td>
                            <td className='text-right'><Link href={`/species/${item.id}`} className='btn btn-secondary btn-xs'>View</Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {

    const pb = await initPocketBase(context);
    console.log('pb.authStore.model', pb.authStore.model);

    return {
        props: {}
    }
}