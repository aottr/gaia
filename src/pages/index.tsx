import initPocketBase from "@/helpers/initPocketbase";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import PocketBase from 'pocketbase'

export default function Home({ authData }: any) {
  const router = useRouter();

  useEffect(() => {
    const pb = new PocketBase('http://localhost:8090');

    if (!pb.authStore.isValid) {
      router.push('/login'); // Redirect to the login page
    }
  }, []);
  return (
    <span>Test</span>
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