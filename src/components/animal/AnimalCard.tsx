import { IconGenderFemale, IconGenderMale } from '@tabler/icons-react';
import getConfig from 'next/config';
import Link from 'next/link';

const AnimalCard = ({ animal }: { animal: any }) => {

    const { publicRuntimeConfig } = getConfig();

    return (
        <Link href={`/animals/${animal.id}`} key={animal.id}>
            <div className="card card-side bg-base-200 shadow-xl m-2 hover:shadow-2xl hover:cursor-pointer flex flex-row">
                {animal.thumbnail ? (
                    <img className='w-36 h-36 rounded-l-xl' src={`${publicRuntimeConfig.pocketbase}/api/files/animal/${animal.id}/${animal.thumbnail}?thumb=150x150`} />
                ) : (
                    <figure className='w-36 h-36 bg-gray-600 p-8'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className='fill-gray-400'>
                            <path d="M256 96c0-53 43-96 96-96h38.4C439.9 0 480 40.1 480 89.6V176v16V376c0 75.1-60.9 136-136 136s-136-60.9-136-136V296c0-22.1-17.9-40-40-40s-40 17.9-40 40V464c0 26.5-21.5 48-48 48s-48-21.5-48-48V296c0-75.1 60.9-136 136-136s136 60.9 136 136v80c0 22.1 17.9 40 40 40s40-17.9 40-40V192H352c-53 0-96-43-96-96zm144-8a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z" />
                        </svg>
                    </figure>
                )}
                <div className="p-3 flex-grow flex flex-col">
                    <h5 className="text-right text-xs italic">{(animal.expand?.species as any).latin_name}</h5>
                    <div className='flex-grow'>
                        <h1 className='font-bold'>{animal.name ? animal.name : (animal.expand.species as any).common_name}</h1>
                        <div className='flex flex-wrap mt-2'>
                            {animal.expand?.morph && animal.expand?.morph.map((morph: { name: string }) => (
                                <div className="badge badge-secondary badge-sm mr-1 mb-1" key={morph.name}>{morph.name}</div>
                            ))}
                        </div>
                    </div>
                    <span className='text-right text-sm'>{animal.sex == 'f' ? <IconGenderFemale size={20} className="inline" /> : <IconGenderMale size={20} className="inline" />}</span>
                </div>
            </div>
        </Link>);
}

export default AnimalCard;