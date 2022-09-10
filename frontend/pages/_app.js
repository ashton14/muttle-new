import App from 'next/app';
import React from 'react';
import Layout from '../components/layout';
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/global.css'
import { Cookies, CookiesProvider } from 'react-cookie';
import { AuthProvider } from '../lib/context/AuthContext';

function MyApp({ Component, cookies, pageProps }) {
  const isBrowser = typeof window !== 'undefined';
  return (
    <CookiesProvider cookies={isBrowser ? undefined : new Cookies(cookies)}>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </CookiesProvider>
  )
}

MyApp.getInitialProps = async function(context) {
  const cookies = context.ctx.req?.cookies;
  const appProps = await App.getInitialProps(context);
return { ...appProps, cookies };
}

export default MyApp;
