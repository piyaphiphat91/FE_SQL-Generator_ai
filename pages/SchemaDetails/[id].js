import { PageHeader, Space, Input } from '@arco-design/web-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import { DataGrid, GridValueGetterParams } from '@mui/x-data-grid';
import {
    Typography,
    Box,
    TextField,
    Grid,
    IconButton,
    Button,
    Paper,
    InputBase,
    SnackbarContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import HouseIcon from '@mui/icons-material/House';
const BASE_URL = 'http://localhost:3001';
import SendIcon from '@mui/icons-material/Send';
const Home = () => {
    const router = useRouter();
    const { id } = router.query;
    const [textToSql, setTextToSql] = useState({
        text: '',
        sql: '',
    });
    const [tableName, setTableName] = useState([]);
    const [processData, setProcessData] = useState([]);
    const [column, setColumns] = useState([]);
    const { data: dataSession } = useSession();
    const [recommend, setRecommend] = useState([]);
    const [recommendColumn, setRecommendColumn] = useState('');
    const [recommendTable, setRecommendTable] = useState('');

    const convertToSql = () => {
        let body = {
            model: 'text-davinci-003',
            prompt: 'mysql for selects' + textToSql.text,
            temperature: 0.3,
            max_tokens: 100,
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
                console.log('response ', respond);
                console.log('response text', respond.data.choices[0].text);
                const inputString = respond.data.choices[0].text;
                const sqlPattern = /SELECT\s+\*[^;]+;/g;

                const sqlCommands = inputString.match(sqlPattern); // ค้นหาคำสั่ง SQL ทั้งหมดในสตริง
                let responseSql = '';
                if (sqlCommands) {
                    for (const sqlCommand of sqlCommands) {
                        responseSql += sqlCommand;
                    }
                } else {
                    console.log('No SQL commands found.');
                }
                console.log(' SQL commands ', responseSql);
                setTextToSql({ ...textToSql, sql: responseSql, text: textToSql.text });
            })
            .catch(error => {
                console.log('error', error);
            });
    };

    const process = async () => {
        let body = {
            sql: textToSql.sql,
            schemaName: id,
        };
        await axios
            .post(BASE_URL + `/process`, body, {})
            .then(async res => {
                if (res.status == 201) {
                    alert(res.data.message);
                    if (res.data?.result?.length > 0) {
                        const generateRowId = () => {
                            return Math.random().toString(36).substring(7); // สร้าง id สุ่ม
                        };

                        // เพิ่มคอลัมน์ id สุ่มลงในแถว
                        let rows = res.data.result.map(row => ({ ...row, id: generateRowId() }));
                        setProcessData(rows);

                        let col = [];
                        const ojb = res.data.result[0];
                        for (const property in ojb) {
                            col.push({
                                field: property,
                                headerName: property,
                                flex: 1,
                            });
                        }
                        setColumns(col);
                    } else {
                        setProcessData([]);
                    }
                    getTableName();
                }
            })
            .catch(error => {
                alert(
                    'คำสั่ง SQL ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง : ' +
                        error.response?.data?.sqlMessage
                );
                console.log('error', error);
            });
    };

    const getTableName = async () => {
        if (id) {
            let res = await axios.get(BASE_URL + `/getTableName?schemaName=${id}`);
            if (res?.status == 200) {
                setTableName(res.data);
            }
        }
    };

    function DataGridTitle() {
        return (
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5">Users</Typography>
            </Box>
        );
    }
    const getColumnName = async () => {
        console.log(textToSql.sql);
        if (textToSql?.sql != '') {
            let regexFROM = /(?<=(FROM|from)\s)([^\s|^;]+)/;
            let regexINTO = /(?<=(INTO|into)\s)([^\s|^;]+)/;
            let regexUPDATE = /(?<=(UPDATE|update)\s)([^\s|^;]+)/;
            let result =
                textToSql?.sql?.match(regexINTO) ||
                textToSql?.sql?.match(regexFROM) ||
                textToSql?.sql?.match(regexUPDATE);
            if (result?.length > 0) {
                let filterTableName = tableName?.filter(val => val?.table_name == result[0]);
                if (filterTableName?.length > 0) {
                    let res = await axios.get(`${BASE_URL}/getColumnName/${id}/${result[0]}`);
                    console.log(res?.data);
                    setRecommend(res?.data);
                    if (res?.data?.length > 0) {
                        let text = '';
                        res.data.map((i, index) => {
                            text += index != 0 ? ', ' + i.column_name : i.column_name;
                            index++;
                        });
                        setRecommendColumn(text);
                    }
                } else {
                    console.log(tableName);
                    setRecommend(tableName);
                    if (tableName?.length > 0) {
                        let text = '';
                        tableName?.map((i, index) => {
                            text += index != 0 ? ', ' + i.table_name : i.table_name;
                            index++;
                        });
                        setRecommendTable(text);
                    }
                }
            }
        }
    };

    useEffect(() => {
        getTableName();
    }, []);

    useEffect(() => {
        getColumnName();
    }, [textToSql.sql]);

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
                                    <h5 style={{ color: '#FFFFFF' }}>/Home/SQL GENERATOR</h5>
                                </div>
                                {/* <font color="#FFFFFF">ข้อความใหม่ที่ต้องการเพิ่ม3</font> */}
                            </div>
                        </div>
                    </>
                }
                extra={
                    <Space>
                        <div>
                            <center>
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
                                >
                                    USER: {dataSession ? dataSession?.user?.name : ''}
                                </div>
                            </center>
                        </div>
                    </Space>
                }
            />
            {/* <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '80vh',
                    overflow: 'auto',
                    // paddingTop: '100px',
                    // paddingBottom: '100px',
                }}
            > */}

            <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
                <div style={{ flex: '30%', marginLeft: '60px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '50px' }}>
                        <div style={{ margin: 'auto', textAlign: 'center' }}>
                            <h1>ชื่อฐานข้อมูลที่เลือก: {id}</h1>
                        </div>
                    </div>
                    {/* <div
                        style={{
                            height: '80vh',
                            overflow: 'auto',
                            marginTop: '70px',
                        }}
                    > */}
                    <div
                        style={{
                            display: 'grid',
                            placeItems: 'center',
                            overflow: 'auto',
                            // marginTop: '100px',
                        }}
                    >
                        <Space>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft: '50px',
                                }}
                            >
                                <Grid
                                    container
                                    spacing={1}
                                    direction="column"
                                    rowSpacing={1}
                                    style={{ height: 'auto' }}
                                >
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <div style={{ marginTop: '20px' }}>
                                                <h5>ข้อมูลที่ท่านต้องการค้นหา</h5>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Grid container spacing={0}>
                                                <Grid item xs={10}>
                                                    <Paper
                                                        component="form"
                                                        sx={{
                                                            p: '4px 8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            height: '50px',
                                                            // width: 500,
                                                        }}
                                                    >
                                                        <InputBase
                                                            sx={{ ml: 1, flex: 1 }}
                                                            value={textToSql.text}
                                                            onChange={e =>
                                                                setTextToSql({
                                                                    ...textToSql,
                                                                    text: e.target.value,
                                                                })
                                                            }
                                                            placeholder="กรุณากรอกข้อมูล"
                                                            inputProps={{
                                                                'aria-label': 'กรุณากรอกข้อมูล',
                                                            }}
                                                        />
                                                    </Paper>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={7}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                    }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        endIcon={<SearchIcon />}
                                                        onClick={() => {
                                                            if (!textToSql.text) {
                                                                return alert('กรุณากรอกข้อมูล');
                                                            } else {
                                                                convertToSql();
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: '#50A6D8',
                                                            marginLeft: '20px',
                                                            marginTop: '8px',
                                                        }}
                                                    >
                                                        สร้าง SQL โดย AI
                                                    </Button>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={3}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                    }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        endIcon={<DeleteIcon />}
                                                        onClick={() => {
                                                            if (!textToSql.text) {
                                                                // return alert('กรุณากรอกข้อมูล');
                                                            } else {
                                                                setTextToSql({
                                                                    ...textToSql,
                                                                    text: '',
                                                                    sql: '',
                                                                });
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: '#FF6347',
                                                            marginTop: '8px',
                                                        }}
                                                    >
                                                        ล้างข้อมูล
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid
                                        xs={12}
                                        style={{
                                            marginTop: '10px',
                                            height: '50px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {console.log('check wa', recommend)}
                                        {recommend[0]?.column_name && (
                                            <>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                    }}
                                                >
                                                    <div style={{ textAlign: 'center' }}>
                                                        <h5>คำแนะนำ</h5>
                                                    </div>
                                                </div>
                                                <SnackbarContent
                                                    message={
                                                        'ฟิลด์ที่ตรงกับตาราง \n' + recommendColumn
                                                    }
                                                    style={{
                                                        backgroundColor: '#F7DC6F',
                                                        color: '#424242',
                                                        maxWidth: 500,
                                                    }}
                                                />
                                            </>
                                        )}
                                    </Grid>
                                    <Grid
                                        xs={12}
                                        style={{
                                            marginTop: '10px',
                                            height: '50px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {recommend[0]?.table_name && (
                                            <>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                    }}
                                                >
                                                    <div style={{ textAlign: 'center' }}>
                                                        <h5>คำแนะนำ</h5>
                                                    </div>
                                                </div>
                                                <SnackbarContent
                                                    message={
                                                        'กรุณาใส่ชื่อตารางให้ถูกต้อง \n' +
                                                        recommendTable
                                                    }
                                                    style={{
                                                        backgroundColor: '#F7DC6F',
                                                        color: '#424242',
                                                        maxWidth: 500,
                                                    }}
                                                />
                                            </>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <div style={{ marginTop: '20px' }}>
                                            <h5>SQL ที่ AI แนะนำ</h5>
                                        </div>
                                    </Grid>
                                    <Grid xs={12}>
                                        <TextField
                                            label=""
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={8}
                                            onChange={e => {
                                                if (e.target.value == '') {
                                                    setTextToSql('');
                                                } else {
                                                    setTextToSql({
                                                        ...textToSql,
                                                        sql: e.target.value,
                                                    });
                                                }
                                            }}
                                            value={textToSql.sql}
                                            style={{
                                                marginTop: '16px',
                                                height: '230px',
                                                width: '500px',
                                            }}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                                    >
                                        <Button
                                            variant="contained"
                                            endIcon={<SendIcon />}
                                            onClick={process}
                                            style={{
                                                backgroundColor: '#2baf2b',
                                                marginRight: '90px',
                                            }}
                                        >
                                            แสดงข้อมูลจากฐานข้อมูล
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        </Space>
                    </div>
                </div>
                <div
                    style={{
                        flex: '70%',
                        overflow: 'auto',
                        height: '80vh',
                        // marginTop: '35px',
                    }}
                >
                    {console.log('table ', processData.length)}
                    {processData.length > 0 ? (
                        <>
                            <div style={{ textAlign: 'center' }}>
                                <h3>ผลลัพธ์จากการค้นหาข้อมูล</h3>
                            </div>
                            <div>
                                <DataGrid
                                    rows={processData}
                                    columns={column}
                                    disableSelectionOnClick
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 10 },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 15]}
                                    // pageSizeOptions={[5, 10, 15]}
                                />
                            </div>
                        </>
                    ) : (
                        <img
                            src="../images/search-not-found.jpg"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scale(0.8)',
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
