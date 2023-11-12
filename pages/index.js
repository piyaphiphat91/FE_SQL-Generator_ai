import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Button,
    Card,
    PageHeader,
    Space,
    Typography,
    Steps,
    Grid,
    Modal,
    Form,
    Input,
    Select,
    Message,
    Notification,
    Dropdown,
    Menu,
} from '@arco-design/web-react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import { Parser } from '@dbml/core';
import { nanoid } from 'nanoid';
import { useSession, signOut } from 'next-auth/react';
import { addGraph, delGraph, getAllGraphs } from '../data/db';
import graphState from '../hooks/use-graph-state';
import tableModel from '../hooks/table-model';
import { IconDown } from '@arco-design/web-react/icon';
import ComRadioGroup from '../pages/tools/index';

const BASE_URL = 'http://localhost:3001';

const Row = Grid.Row;
const Col = Grid.Col;
const { Meta } = Card;
const Step = Steps.Step;
const FormItem = Form.Item;
// import IconGithub from '../public/images/github.svg';

export default function Home() {
    const router = useRouter();
    const { theme, setTableDict, setLinkDict, tableList } = graphState.useContainer();
    const { calcXY } = tableModel();
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [text, setText] = useState('');
    const [graphs, setGraphs] = useState([]);
    const { data: dataSession } = useSession();
    const [sqlGenModal, setSqlGenModal] = useState(false);
    const [dropdownGenList, setDropdownGenList] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);

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

    const handlerImportGraph = async ({ tableDict, linkDict }) => {
        const id = await addGraph({ tableDict, linkDict, name: text }, null, dataSession);
        // router.push(`/myprojectlist/${id}`);
        router.push(`/myprojectlist/`);
    };

    function onOk() {
        form.validate().then(res => {
            setConfirmLoading(true);
            // handleOk(mockData)
            let body = {
                model: 'text-davinci-003',
                prompt: 'create sql database for ' + text + 'แบบครบถ้วน',
                temperature: 0.3,
                max_tokens: 3000,
                top_p: 0.1,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            };

            axios
                .post('https://api.openai.com/v1/completions', body, {
                    headers: {
                        Authorization: 'Bearer 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',
                    },
                })
                .then(respond => {
                    console.log('response ', respond.data.choices[0].text);
                    // respond.data.choices[0].text
                    handleOk(respond.data.choices[0].text);
                    setVisible(false);
                    setConfirmLoading(false);
                })
                .catch(error => {
                    console.log('error', error);
                    setVisible(false);
                    setConfirmLoading(false);
                });
        });
        // handleOk(`CREATE DATABASE Inventory;

        // USE Inventory;

        // CREATE TABLE Products (
        //     ProductID INT NOT NULL AUTO_INCREMENT,
        //     ProductName VARCHAR(255) NOT NULL,
        //     ProductDescription VARCHAR(255) NOT NULL,
        //     Price DECIMAL(10,2) NOT NULL,
        //     Quantity INT NOT NULL,
        //     PRIMARY KEY (ProductID)
        // );

        // CREATE TABLE Orders (
        //     OrderID INT NOT NULL AUTO_INCREMENT,
        //     CustomerName VARCHAR(255) NOT NULL,
        //     OrderDate DATE NOT NULL,
        //     PRIMARY KEY (OrderID)
        // );

        // CREATE TABLE OrderItems (
        //     OrderItemID INT NOT NULL AUTO_INCREMENT,
        //     OrderID INT NOT NULL,
        //     ProductID INT NOT NULL,
        //     Quantity INT NOT NULL,
        //     PRIMARY KEY (OrderItemID),
        //     FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
        //     FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        // );`);
    }

    const handleOk = async value => {
        if (!value) {
            setVisible(false);
            setConfirmLoading(false);
            return;
        }
        try {
            const result = await Parser.parse(value, 'mysql');
            const graph = result.schemas[0];
            const tableDict = {};
            const linkDict = {};
            const tables = [...tableList];
            graph.tables.forEach((table, index) => {
                const id = nanoid();
                const [x, y] = calcXY(0, tables);
                const newTable = {
                    id,
                    name: table.name,
                    note: table.note,
                    x,
                    y,
                    fields: table.fields.map(field => {
                        const fieldId = nanoid();
                        return {
                            id: fieldId,
                            increment: field.increment,
                            name: field.name,
                            not_null: field.not_null,
                            note: field.note,
                            pk: field.pk,
                            unique: field.unique,
                            type: field.type.type_name.toUpperCase(),
                        };
                    }),
                };
                console.log(newTable);
                tableDict[id] = newTable;
                tables.push(newTable);
            });

            graph.refs.forEach(ref => {
                const id = nanoid();
                linkDict[id] = {
                    id,
                    endpoints: ref.endpoints.map(endpoint => {
                        const table = Object.values(tableDict).find(
                            table => table.name === endpoint.tableName
                        );
                        return {
                            id: table.id,
                            relation: endpoint.relation,
                            fieldId: table.fields.find(
                                field => field.name === endpoint.fieldNames[0]
                            ).id,
                        };
                    }),
                };
                console.log(linkDict);
            });

            setTableDict(state => ({
                ...state,
                ...tableDict,
            }));
            setLinkDict(state => ({
                ...state,
                ...linkDict,
            }));
            // setValue('');
            // onCloseModal();
            handlerImportGraph({ tableDict, linkDict });
        } catch (e) {
            console.log(e);
            Notification.error({
                title: 'Parse failed',
            });
        }
    };

    const formItemLayout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 20,
        },
    };

    const getDropDownList = async () => {
        try {
            const { data } = await axios
                // .get(BASE_URL + `/getSchemaNameByEmail?email=${dataSession.user.email}`)
                .get(BASE_URL + `/getSchemaList`)
                .then(res => res)
                .catch(error => {
                    console.log('error', error);
                });
            console.log('bird gen List dropdown', data);
            let dataFilter = data.filter(i => i.Database != 'information_schema');
            let dataFilter1 = dataFilter.filter(i => i.Database != 'mysql');
            let dataFilter2 = dataFilter1.filter(i => i.Database != 'sys');
            let dataFilter3 = dataFilter2.filter(i => i.Database != 'performance_schema');
            console.log('bird gen List dataFilter', dataFilter3);

            setDropdownGenList(dataFilter3);
        } catch (e) {
            console.log(e);
        }
    };
    const handleSignOut = () => {
        signOut();
    };
    const handleMenuItemClick = val => {
        setSelectedValue(val); // Update the selected value
    };

    const handleChangeRadioGroup = item => {
        console.log('bird check event', item);
        setSelectedValue({ Database: item });
    };
    return (
        <>
            <Head>
                <title>Automated SQL Generator System </title>
                <meta
                    name="description"
                    content="Database design tool based on entity relation diagram"
                />
                <link rel="icon" href="/favicon.ico" />
                <style>{'body { overflow: auto !important; }'}</style>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback"
                />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
                />
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
                    extra={
                        <Space>
                            <div></div>
                            <div>
                                <center>
                                    <img
                                        src="../images/button/signOut_H.png"
                                        width="45"
                                        height="45"
                                        onClick={handleSignOut}
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
                                    >
                                        USER: {dataSession ? dataSession?.user?.name : ''}
                                    </div>
                                </center>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* <div>email: {dataSession ? dataSession?.user?.email : ''}</div> */}
                            </div>
                            {/* <Link href="/graphs">
                                <Button type="primary">
                                    Get started free & no registration required.
                                </Button>
                            </Link>

                            <Button
                                type="primary"
                                icon={<IconGithub className="arco-icon" />}
                                style={{ backgroundColor: '#333' }}
                                href="https://github.com/findyourmagic/dber"
                            >
                                Repository
                            </Button> */}
                        </Space>
                    }
                />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: '80vh',
                    }}
                >
                    <Row className="grid-demo" style={{ marginBottom: 16 }}>
                        <Space>
                            <Col span={12}>
                                {/* <Link href="/dbgen"> */}
                                <Card
                                    onClick={() => setVisible(true)}
                                    hoverable
                                    style={{ width: 400, cursor: 'pointer' }}
                                    cover={
                                        <div style={{ overflow: 'hidden', objectFit: 'contain' }}>
                                            <img
                                                style={{
                                                    width: '270px',
                                                    height: '250px',
                                                    // transform: 'translateY(-20px)',
                                                }}
                                                alt="dbGen"
                                                src="/images/databaseGen.png"
                                            />
                                        </div>
                                    }
                                >
                                    <Meta title="DATABASE GENERATOR" description={<></>} />
                                </Card>
                                {/* </Link> */}
                            </Col>

                            <Col span={12}>
                                <Card
                                    onClick={() => router.push(`/myprojectlist`)}
                                    hoverable
                                    style={{ width: 400, cursor: 'pointer' }}
                                    cover={
                                        <div style={{ height: 250, overflow: 'hidden' }}>
                                            <img
                                                style={{
                                                    width: '270px',
                                                    height: '250px',
                                                    // transform: 'translateY(-20px)',
                                                }}
                                                alt="sqlGen"
                                                src="/images/myProjectDesign.png"
                                            />
                                        </div>
                                    }
                                >
                                    <Meta title="MY PROJECT DESIGN" description={<></>} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card
                                    onClick={async () => {
                                        // router.push(`/databaseList`);
                                        setSqlGenModal(true);
                                        getDropDownList();
                                    }}
                                    hoverable
                                    style={{ width: 400, cursor: 'pointer' }}
                                    cover={
                                        <div style={{ height: 250, overflow: 'hidden' }}>
                                            <img
                                                style={{
                                                    width: '300px',
                                                    height: '250px',
                                                    // transform: 'translateY(-20px)',
                                                }}
                                                alt="sqlGen"
                                                src="/images/sqlGenerator.png"
                                            />
                                        </div>
                                    }
                                >
                                    <Meta title="SQL GENERATOR" description={<></>} />
                                </Card>
                            </Col>
                        </Space>
                    </Row>
                </div>
            </div>

            <Modal
                title="DATABASE GENERATOR"
                visible={visible}
                onOk={onOk}
                confirmLoading={confirmLoading}
                onCancel={() => setVisible(false)}
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    labelCol={{
                        style: { flexBasis: 90 },
                    }}
                    wrapperCol={{
                        style: { flexBasis: 'calc(100% - 90px)', flexGrow: 1 },
                    }}
                >
                    <FormItem field="ระบบ/ธุรกิจ" rules={[{ required: true }]}>
                        <Input
                            onChange={value => setText(value)}
                            placeholder="กรุณาระบุชื่อระบบ/ธุรกิจ ที่ท่านต้องการสร้างฐานข้อมูล"
                        />
                    </FormItem>
                </Form>
            </Modal>

            {dropdownGenList.length > 0 && (
                <Modal
                    title="SQL GENERATOR"
                    visible={sqlGenModal}
                    onOk={() => {
                        console.log(selectedValue);
                        if (selectedValue) {
                            router.push(`/SchemaDetails/${selectedValue?.Database}`);
                            setSqlGenModal(false);
                        }
                    }}
                    onCancel={() => setSqlGenModal(false)}
                    autoFocus={false}
                    focusLock={true}
                    okText={'ตกลง'}
                    cancelText={'ปิด'}
                >
                    {/* <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        <nav aria-label="main mailbox folders">
                            <List>
                                {dropdownGenList.map((val, i) => {
                                    return (
                                        <ListItem key={i}>
                                            <ListItemButton
                                                onClick={() => handleMenuItemClick(val)}
                                            >
                                                <ListItemIcon>
                                                    <InboxIcon />
                                                </ListItemIcon>
                                                {val.name}
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </nav>
                        <Divider />

                    </Box> */}
                    <div style={{ height: '20vh', overflowY: 'auto' }}>
                        <ComRadioGroup
                            titleName={'เลือกฐานข้อมูลที่ท่านต้องการดูข้อมูล'}
                            dataList={dropdownGenList.length > 0 ? dropdownGenList : []}
                            handleChange={handleChangeRadioGroup}
                            value={''}
                            selectedValue={selectedValue?.Database}
                        />
                    </div>
                    {/* <Dropdown
                        droplist={
                            <Menu>
                                {dropdownGenList.map((val, i) => (
                                    <Menu.Item key={i} onClick={() => handleMenuItemClick(val)}>
                                        {val?.Database}
                                    </Menu.Item>
                                ))}
                            </Menu>
                        }
                        position="bl"
                    >
                        <Button size="large" type="text">
                            {selectedValue ? selectedValue.Database : 'Select schema'} <IconDown />
                        </Button>
                    </Dropdown> */}
                </Modal>
            )}
        </>
    );
}
