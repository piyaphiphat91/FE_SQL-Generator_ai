import React, { useEffect } from 'react';
import { Button, Card, Grid, Typography } from '@arco-design/web-react';
const Row = Grid.Row;
const Col = Grid.Col;
import { signIn } from 'next-auth/react';
import GoogleButton from 'react-google-button';
import { useRouter } from 'next/router';

import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import { PageHeader } from '@arco-design/web-react';

const index = () => {
    const router = useRouter();
    // const responseGoogle = response => {
    //     console.log(response);
    // };
    const { data, status } = useSession();

    console.log('check20', data);

    if (status === 'authenticated') {
        // Redirect to a specific page
        console.log('warp');
        router.push('/');
    }

    return (
        <>
            <Head>
                <title>Automated SQL Generator System</title>
                <meta
                    name="description"
                    content="Database design tool based on entity relation diagram"
                />
                <link rel="icon" href="/favicon.ico" />
                <style>{'body { overflow: auto !important; }'}</style>
            </Head>
            <div className="index-container">
                <PageHeader
                    style={{
                        background: 'var(--color-bg-2)',
                        backgroundImage: `url("/images/BackgroundHeader.png")`,
                        width: '100%',
                        position: 'sticky',
                        top: 0,
                        boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)',
                        zIndex: 2,
                    }}
                    title={
                        <img
                            style={{
                                width: '75px',
                                height: '50px',
                            }}
                            alt="itd"
                            src="/images/itd-logo.png"
                        />
                    }
                    subTitle={
                        <>
                            <div>
                                <h2>
                                    <font color="#FFFFFF">Automated SQL Generator System</font>
                                </h2>
                                <font color="#FFFFFF">
                                    Faculty of information Technology and Digital Innovation |
                                    KMUTNB{' '}
                                </font>
                            </div>
                        </>
                    }
                />
            </div>

            <div
                className="index-container"
                style={{
                    height: '80vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Card style={{ width: 400 }}>
                    <Row className="grid-demo" style={{ marginBottom: 16 }}>
                        <Col span={24} align="center">
                            <div style={{ overflow: 'hidden', objectFit: 'contain' }}>
                                <img
                                    style={{
                                        width: '250px',
                                        height: '250px',
                                        // transform: 'translateY(-20px)',
                                    }}
                                    alt="dbGen"
                                    src="/images/animation_lk521wzx_small.gif"
                                />
                            </div>

                            <Typography.Title heading={4}>SIGN IN</Typography.Title>
                        </Col>
                        <Col span={24} align="center">
                            <GoogleButton
                                onClick={() => {
                                    signIn('google');
                                }}
                            />
                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    );
};

export default index;
