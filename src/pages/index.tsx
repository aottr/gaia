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
    const pb = new PocketBase(publicRuntimeConfig.pocketbase);

    if (!pb.authStore.isValid) {
      router.push('/login'); // Redirect to the login page
    }
    router.push('/dashboard'); // Redirect to the dashboard page
  }, []);

  return (
    <>

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