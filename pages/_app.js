import '@arco-design/web-react/dist/css/arco.css';
import '../styles/globals.sass';
import GraphContainer from '../hooks/use-graph-state';
import { ConfigProvider } from '@arco-design/web-react';
import { locale_en } from './locale_en';
import Footer from '../components/footer';
import { SessionProvider, useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { Provider } from 'next-auth/react';
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const getLayout = Component.getLayout || (page => page);
    console.log('bird check session', pageProps.session);
    // const { data } = useSession();
    return (
        <GraphContainer.Provider>
            <ConfigProvider locale={locale_en}>
                <SessionProvider session={pageProps.session}>
                    <Layout>
                        <>
                            <Component {...pageProps} />
                        </>
                        <Footer />
                    </Layout>
                </SessionProvider>
                {/* <Provider session={pageProps.session}>
                    <Component {...pageProps} />
                </Provider> */}
            </ConfigProvider>
        </GraphContainer.Provider>
    );
}

export default MyApp;
