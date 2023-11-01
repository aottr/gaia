import Layout from '@/components/Layout';
import NotificationContainer from '@/context/Notification';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <NotificationContainer><Layout><Component {...pageProps} /></Layout></NotificationContainer>
}
