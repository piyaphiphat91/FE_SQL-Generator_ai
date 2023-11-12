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
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import Dexie from 'dexie';
import HouseIcon from '@mui/icons-material/House';

export const db = new Dexie('graphDB');
db.version(4).stores({
    graphs: 'id',
    logs: '++id, graphId',
});

const BASE_URL = 'http://localhost:3001';

const ImportModal = dynamic(() => import('../../components/import_modal'), { ssr: false });

/**
 * It fetches all the graphs from the database and displays them in a list
 * @returns Home component
 */
export default function Home() {
    const router = useRouter();
    const [graphs, setGraphs] = useState([]);
    const [showModal, setShowModal] = useState('');
    const { data: sessionData } = useSession();
    const { theme, setTheme } = graphState.useContainer();

    useEffect(() => {
        const initGraphs = async () => {
            try {
                console.log(sessionData);
                // const data = await getAllGraphs();
                // if (data && data.length) {
                //     data.sort((a, b) => b.createdAt - a.createdAt);
                //     setGraphs(data);
                // }
                const { data } = await axios
                    .get(BASE_URL + `/getProjectLists?email=${sessionData.user.email}`)
                    .then(res => res)
                    .catch(error => {
                        console.log('error', error);
                    });
                console.log(data);
                if (data && data.length) {
                    let sort = data.sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
                    console.log('sort', sort);
                    setGraphs(sort);
                }
            } catch (e) {
                console.log(e);
            }
        };
        initGraphs();
    }, [sessionData]);

    const deleteGraph = async id => {
        await delGraph(id);
        setGraphs(state => state.filter(item => item.id !== id));
    };

    const handlerImportGraph = async ({ tableDict, linkDict }) => {
        const id = await addGraph({ tableDict, linkDict, name: `Untitled graph ${graphs.length}` });
        router.push(`/myprojectlist/${id}`);
    };

    const handlerAddGraph = async () => {
        const id = await addGraph({ name: `Untitled graph ${graphs.length}` }, null, sessionData);
        router.push(`/myprojectlist/${id}`);
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

    const navigateMyProjectListById = async id => {
        let dataFilter = graphs.filter(val => val.id == id)[0];
        await db.graphs.put({
            name: dataFilter.name,
            id: dataFilter.id,
            tableDict: dataFilter.tableDict,
            linkDict: dataFilter.linkDict,
            box: dataFilter.box,
            createdAt: dataFilter.createdAt,
            updatedAt: dataFilter.updatedAt,
        });
        await router.push(`/myprojectlist/${id}`);
    };

    const deleteGraphById = async id => {
        try {
            await delGraph(id);
            setGraphs(state => state.filter(item => item.id !== id));
            const { data } = await axios
                .delete(BASE_URL + `/delProjectLists?email=${sessionData.user.email}&id=${id}`)
                .then(res => res)
                .catch(error => {
                    console.log('error', error);
                });
        } catch (e) {
            console.log(e);
        }
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
                                // justifyContent: 'center',
                                // alignItems: 'center',
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
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <HouseIcon
                                        style={{
                                            height: '30px',
                                            width: '30px',
                                            marginRight: '5px',
                                            marginBottom: 7,
                                            color: '#FFFFFF',
                                        }}
                                    />
                                    <h5 style={{ color: '#FFFFFF' }}>/Home/MY DATABASE LIST</h5>
                                </div>
                                {/* <font color="#FFFFFF">ข้อความใหม่ที่ต้องการเพิ่ม3</font> */}
                            </div>
                        </div>
                    </>
                }
                extra={
                    <Space>
                        <div>
                            <img
                                src="../images/button/signOut_H.png"
                                width="45"
                                height="45"
                                onClick={() => {
                                    signOut();
                                }}
                            ></img>
                            <div
                                style={{
                                    width: '100%',
                                    position: 'sticky',
                                    zIndex: 2,
                                    fontSize: 14,
                                    color: '#FFFFFF',
                                    textAlign: 'center',
                                }}
                            ></div>
                        </div>

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

            <div className="graph-container">
                {graphs && graphs.length ? (
                    <div style={{ overflowY: 'auto', height: '70vh' }}>
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
                                            {/* <Link href={`/myprojectlist/${item.id}`}> */}
                                            <Button
                                                type="primary"
                                                icon={<IconEdit />}
                                                onClick={() => navigateMyProjectListById(item.id)}
                                            />
                                            {/* </Link> */}
                                            <Popconfirm
                                                title="คุณต้องการลบ ฐานข้อมูลนี้ใช่หรือไม่ ?"
                                                okText="Yes"
                                                cancelText="No"
                                                position="br"
                                                onOk={() => deleteGraphById(item.id)}
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
                                        avatar={
                                            <Avatar shape="square">
                                                {item?.name ? item?.name[0] : ''}
                                            </Avatar>
                                        }
                                        title={item.name}
                                        description={
                                            <Space style={{ marginTop: 4 }}>
                                                <Tag color="arcoblue" icon={<IconNav />}>
                                                    {Object.keys(item.tableDict || []).length}{' '}
                                                    tables
                                                </Tag>
                                                {/* <Tag color="green" icon={<IconCopy />}>
                                                    createdAt{' '}
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </Tag> */}
                                                <Tag color="gold" icon={<IconCalendarClock />}>
                                                    updatedAt{' '}
                                                    {new Date(item.updateDate).toLocaleString()}
                                                </Tag>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <div className="tc">
                        <Empty style={{ marginBottom: 16 }} />
                        <Button size="large" type="primary" onClick={() => handlerAddGraph()}>
                            ออกแบบฐานข้อมูลใหม่
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
