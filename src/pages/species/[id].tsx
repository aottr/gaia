import { useState, useEffect } from 'react';
import PocketBase, { Record } from 'pocketbase';
import { useRouter } from 'next/router';
import { IconCloudRain, IconCloudSnow, IconTemperaturePlus, IconTemperatureMinus, IconSunHigh, IconMoonStars } from '@tabler/icons-react';
import getConfig from 'next/config';

export default () => {

    const router = useRouter();
    const { publicRuntimeConfig } = getConfig();
    const [species, setSpecies] = useState<Record | null>(null);

    useEffect(() => {
        const pb = new PocketBase(publicRuntimeConfig.pocketbase);

        if (!pb.authStore.isValid) {
            router.push('/login');
        }
        const fetchSpecies = async () => {
            try {
                const res = await pb.collection('species').getOne(`${router.query.id}`, { expand: 'rel_humidity,morph(species)' });
                setSpecies(res);
            } catch (err) {
                console.log(err);
                router.push('/species');
            }
        };
        if (router.isReady) {
            fetchSpecies();
        }
    }, [router.isReady]);

    return (species && (
        <div className='my-3'>
            <h1 className='text-3xl'>{species.latin_name}</h1>
            <span className='text-sm italic text-primary'>{species.common_name}</span>

            {species.description && (
                <p className='mt-10' dangerouslySetInnerHTML={{ __html: species.description }}></p>
            )}

            {species.substrate && (
                <div>
                    <h2 className="text-xl font-semibold mb-2 mt-10">Substrate</h2>
                    <p>{species.substrate}</p>
                </div>
            )}

            {species.rel_humidity && (
                <div>
                    <h2 className="text-xl font-semibold mb-2 mt-10">Humidity</h2>
                    <div className="stats stats-vertical lg:stats-horizontal shadow bg-neutral">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <IconCloudSnow size={48} className="inline" />
                            </div>
                            <div className="stat-value text-primary">{(species.expand.rel_humidity as any).min}%</div>
                            <div className="stat-desc">{(species.expand.rel_humidity as any).max > 0 && (<>minimal </>)}relative humidity</div>
                        </div>
                        {(species.expand.rel_humidity as any).max > 0 && (
                            <div className="stat">
                                <div className="stat-figure text-primary">
                                    <IconCloudRain size={48} className="inline" />
                                </div>
                                <div className="stat-value text-primary">{(species.expand.rel_humidity as any).max}%</div>
                                <div className="stat-desc">maximal relative humidity</div>
                            </div>)}
                    </div>
                </div>
            )}

            {(species.temperature_warm > 0 || species.temperature_cold > 0 || species.temperature_night > 0 || species.temperature_basking > 0) && (
                <div>
                    <h2 className="text-xl font-semibold mb-2 mt-10">Temperatures</h2>
                    <div className="stats stats-vertical lg:stats-horizontal shadow bg-neutral">
                        {species.temperature_warm && (
                            <div className="stat">
                                <div className="stat-figure text-primary">
                                    <IconTemperaturePlus size={40} className="inline" />
                                </div>
                                <div className="stat-value text-primary">{species.temperature_warm}°C</div>
                                <div className="stat-desc">Warm side</div>
                            </div>
                        )}
                        {species.temperature_cold && (
                            <div className="stat">
                                <div className="stat-figure text-primary">
                                    <IconTemperatureMinus size={40} className="inline" />
                                </div>
                                <div className="stat-value text-primary">{species.temperature_cold}°C</div>
                                <div className="stat-desc">Cold side</div>
                            </div>
                        )}
                        {species.temperature_night && (
                            <div className="stat">
                                <div className="stat-figure text-primary">
                                    <IconMoonStars size={40} className="inline" />
                                </div>
                                <div className="stat-value text-primary">{species.temperature_night}°C</div>
                                <div className="stat-desc">At night</div>
                            </div>
                        )}
                        {species.temperature_basking && (
                            <div className="stat">
                                <div className="stat-figure text-primary">
                                    <IconSunHigh size={40} className="inline" />
                                </div>
                                <div className="stat-value text-primary">{species.temperature_basking}°C</div>
                                <div className="stat-desc">Basking spot</div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {species.expand['morph(species)'] && (
                <>
                    <h2 className="text-xl font-semibold mb-2 mt-10">Morphs</h2>
                    <table className="table max-w-xs">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {species.expand['morph(species)'].map((morph: any) => (
                                <tr key={morph.id}>
                                    <td>{morph.name}</td>
                                    <td>{morph.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

        </div >
    ));

}