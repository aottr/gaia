import initPocketBase from "@/helpers/initPocketbase";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import PocketBase from 'pocketbase';
import { IconCloudRain } from '@tabler/icons-react';
import getConfig from 'next/config';

export default function Home({ authData }: any) {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();

  useEffect(() => {
    const pb = new PocketBase(process.env.POCKETBASE_HOST);

    if (!pb.authStore.isValid) {
      router.push('/login'); // Redirect to the login page
    }
  }, []);

  return (
    <>
      <span>Test</span>
      <div className="radial-progress" style={{ "--value": 70 } as React.CSSProperties}>
        <IconCloudRain size={24} className="inline" /> 70%
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const pb = await initPocketBase(context);
  const authData = JSON.parse(JSON.stringify(pb.authStore));
  return {
    props: {
      authData,
    }
  }
}