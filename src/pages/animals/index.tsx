import initPocketBase from "@/helpers/initPocketbase";
import type { GetServerSidePropsContext } from "next";
import Link from 'next/link';
import PocketBase from 'pocketbase';
import useSWR from 'swr';
import { useState } from 'react';
import { IconGenderFemale, IconGenderMale } from '@tabler/icons-react';
import getConfig from 'next/config'

const AnimalsIndex = () => {

    const { publicRuntimeConfig } = getConfig();

    const fetcher = () => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);
        return pb.collection("animal").getFullList(100, {
            sort: "name", expand: "species.classification"
        }).then((res) => { return res; });
    }

    const [classification, setClassification] = useState(null);
    const { data, error, isLoading } = useSWR('animals', fetcher)

    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <>
            <div className='flex flex-row my-4 justify-end'>
                <div className="join">
                    {data && [...(data.map(item => ((item.expand.species as any).expand.classification as any).common_name))].filter((value, index, array) => array.indexOf(value) === index).map((classification) => (
                        <input key={classification} className="join-item btn btn-sm" type="radio" name="classification" aria-label={classification} onClick={() => setClassification(classification)} />
                    ))}
                    <input className="join-item btn btn-sm" type="radio" name="classification" aria-label="All" onClick={() => setClassification(null)} checked={!classification} />
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Species</th>
                        <th>Gender</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>

                    {classification && data?.map((item) => (((item.expand.species as any).expand.classification as any).common_name === classification) && (
                        <tr key={item.id}>
                            <td>{item.name ? item.name : (item.expand.species as any).common_name}</td>
                            <td>
                                <div className="badge badge-sm badge-primary badge-outline">{(item.expand?.species as any).common_name}</div>
                                <div className="ml-1 badge badge-sm badge-secondary badge-outline">{((item.expand.species as any).expand.classification as any).common_name}</div>
                            </td>
                            <td>{item.gender == 'f' ? <IconGenderFemale size={20} className="inline" /> : <IconGenderMale size={20} className="inline" />}</td>
                            <td className='text-right'><Link href={`/animals/${item.id}`} className='btn btn-secondary btn-xs'>View</Link></td>
                        </tr>
                    ))}

                    {!classification && data?.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name ? item.name : (item.expand.species as any).common_name}</td>
                            <td>
                                <div className="badge badge-sm badge-primary badge-outline">{(item.expand?.species as any).common_name}</div>
                                <div className="ml-1 badge badge-sm badge-secondary badge-outline">{((item.expand.species as any).expand.classification as any).common_name}</div>
                            </td>
                            <td>{item.gender == 'f' ? <IconGenderFemale size={20} className="inline" /> : <IconGenderMale size={20} className="inline" />}</td>
                            <td className='text-right'><Link href={`/animals/${item.id}`} className='btn btn-secondary btn-xs'>View</Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default AnimalsIndex;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {

    const pb = await initPocketBase(context);

    return {
        props: {}
    }
}