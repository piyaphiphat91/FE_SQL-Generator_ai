import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
    List,
    Button,
    Empty,
    Space,
    Avatar,
    Popconfirm,
    Notification,
    Divider,
    Tag,
    PageHeader,
    Switch,
} from '@arco-design/web-react';
import {
    IconEdit,
    IconDelete,
    IconNav,
    IconCalendarClock,
    IconCopy,
    IconMoonFill,
    IconSunFill,
} from '@arco-design/web-react/icon';
import { useState, useEffect } from 'react';
import { addGraph, delGraph, getAllGraphs } from '../../data/db';
import ListNav from '../../components/list_nav';
import northwindTraders from '../../data/example/northwind_traders.json';
import blog from '../../data/example/blog.json';
import spaceX from '../../data/example/spacex.json';
import graphState from '../../hooks/use-graph-state';
import { signOut } from 'next-auth/react';

const ImportModal = dynamic(() => import('../../components/import_modal'), { ssr: false });

/**
 * It fetches all the graphs from the database and displays them in a list
 * @returns Home component
 */
export default function Home() {
    const router = useRouter();
    const [graphs, setGraphs] = useState([]);
    const [showModal, setShowModal] = useState('');
    const { theme, setTheme } = graphState.useContainer();

    useEffect(() => {
        const initGraphs = async () => {
            try {
                const data = await getAllGraphs();
                if (data && data.length) {
                    data.sort((a, b) => b.createdAt - a.createdAt);
                    setGraphs(data);
                }
            } catch (e) {
                console.log(e);
            }
        };
        initGraphs();
    }, []);

    const deleteGraph = async id => {
        await delGraph(id);
        setGraphs(state => state.filter(item => item.id !== id));
    };

    const handlerImportGraph = async ({ tableDict, linkDict }) => {
        const id = await addGraph({ tableDict, linkDict, name: `Untitled graph ${graphs.length}` });
        router.push(`/graphs/${id}`);
    };

    const handlerAddGraph = async () => {
        const id = await addGraph({ name: `Untitled graph ${graphs.length}` });
        router.push(`/graphs/${id}`);
    };

    const handlerAddExample = async () => {
        await Promise.all(
            [northwindTraders, blog, spaceX].map(({ id, ...item }) => addGraph(item, id))
        );
        setGraphs(state => [northwindTraders, blog, spaceX, ...state]);
        Notification.success({
            title: 'Sample data generated success.',
        });
    };

    return (
        <>
            <Head>
                <title>Automated SQL Generator System</title>
                <meta
                    name="description"
                    content="Database design tool based on entity relation diagram"
                />
                <link rel="icon" href="/favicon.ico" />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
                />
            </Head>
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
                        onClick={() => router.push(`/`)}
                        style={{
                            width: '75px',
                            height: '50px',
                            cursor: 'pointer',
                        }}
                        alt="itd"
                        src="/images/itd-logo.png"
                    />
                }
                subTitle={
                    <>
                        {/* <div>
                            <h2>
                                <font color="#FFFFFF">Automated SQL Generator System</font>
                            </h2>
                            <font color="#FFFFFF">
                                Faculty of information Technology and Digital Innovation | KMUTNB{' '}
                            </font>
                        </div> */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <div>
                                <h2>
                                    <font color="#FFFFFF">Automated SQL Generator System</font>
                                </h2>
                                <font color="#FFFFFF">
                                    Faculty of Information Technology and Digital Innovation |
                                    KMUTNB
                                </font>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <font color="#FFFFFF">ข้อความใหม่ที่ต้องการเพิ่ม4</font>
                            </div>
                        </div>
                    </>
                }
                extra={
                    <Space>
                        <a href="/">
                            <img src="../images/button/home_H.png" width="45" height="45"></img>
                        </a>

                        <a href="#">
                            <img
                                src="../images/button/signOut_H.png"
                                width="45"
                                height="45"
                                onClick={() => {
                                    signOut();
                                }}
                            ></img>
                        </a>

                        {/* <Button
                            size="small"
                            type="primary"
                            shape="round"
                            onClick={() => handlerAddGraph()}
                        >
                            + New graph
                        </Button> */}
                        {/* <Button size="small" shape="round" onClick={() => handlerAddExample()}>
                            Example graph
                        </Button> */}
                    </Space>
                }
            />
            {/* <ListNav
                addGraph={() => handlerAddGraph()}
                importGraph={() => setShowModal('import')}
                addExample={() => handlerAddExample()}
            /> */}

            <div class="row">
                <div class="col-sm-12">
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-left">
                            <li class="breadcrumb-item">
                                <a href="/">Home</a>
                            </li>
                            <li class="breadcrumb-item active">MY PROJECT LIST</li>
                        </ol>
                    </div>
                    <div align="right" class="col-sm-12"></div>
                </div>
                <div class="row mb-2">
                    <div class="col-sm-12" align="left"></div>
                </div>
            </div>
            <div className="graph-container">
                {graphs && graphs.length ? (
                    <List
                        className="graph-list"
                        size="large"
                        header="My Database List"
                        dataSource={graphs}
                        render={(item, index) => (
                            <List.Item
                                key={item.id}
                                extra={
                                    <Space>
                                        <Link href={`/myprojectlist/${item.id}`}>
                                            <Button type="primary" icon={<IconEdit />} />
                                        </Link>
                                        <Popconfirm
                                            title="คุณต้องการลบ ฐานข้อมูลนี้ใช่หรือไม่ ?"
                                            okText="Yes"
                                            cancelText="No"
                                            position="br"
                                            onOk={() => deleteGraph(item.id)}
                                        >
                                            <Button
                                                type="primary"
                                                status="danger"
                                                icon={<IconDelete />}
                                            />
                                        </Popconfirm>
                                    </Space>
                                }
                            >
                                <List.Item.Meta
                                    avatar={<Avatar shape="square">{item.name[0]}</Avatar>}
                                    title={item.name}
                                    description={
                                        <Space style={{ marginTop: 4 }}>
                                            <Tag color="arcoblue" icon={<IconNav />}>
                                                {Object.keys(item.tableDict || []).length} tables
                                            </Tag>
                                            <Tag color="green" icon={<IconCopy />}>
                                                createdAt{' '}
                                                {new Date(item.createdAt).toLocaleString()}
                                            </Tag>
                                            <Tag color="gold" icon={<IconCalendarClock />}>
                                                updatedAt{' '}
                                                {new Date(item.updatedAt).toLocaleString()}
                                            </Tag>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="tc">
                        <Empty style={{ marginBottom: 16 }} />
                        <Button size="large" type="primary" onClick={() => handlerAddGraph()}>
                            Create new graph now
                        </Button>
                        <Divider orientation="center">OR</Divider>
                        <Button size="large" type="outline" onClick={() => handlerAddExample()}>
                            Create new graph example
                        </Button>
                    </div>
                )}
            </div>
            <ImportModal
                showModal={showModal}
                onCloseModal={() => setShowModal('')}
                cb={args => handlerImportGraph(args)}
            />
        </>
    );
}
