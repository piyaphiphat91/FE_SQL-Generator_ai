import { PageHeader, Space, Input } from '@arco-design/web-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Grid, IconButton, Button, Paper, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
const BASE_URL = 'http://localhost:3001';

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

    const [recommend, setRecommend] = useState([]);
    const convertToSql = () => {
        let body = {
            model: 'text-davinci-003',
            prompt: 'sql select' + textToSql.text,
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
                setTextToSql({ ...textToSql, sql: responseSql });
            })
            .catch(error => {
                console.log('error', error);
            });
    };

    const process = () => {
        let body = {
            sql: textToSql.sql,
            schemaName: id,
        };
        axios
            .post(BASE_URL + `/process`, body, {})
            .then(res => {
                if (res.status == 201) {
                    alert(res.data.message);
                    setProcessData(res.data.result);
                    if (res.data?.result?.length > 0) {
                        let col = [];
                        console.log('bird', recommend);
                        recommend.map(i => {
                            col.push({
                                field: i.column_name,
                                headerName: i.column_name,
                                flex: 1,
                            });
                        });
                        console.log('bird col', col);
                        console.log('bird res.data.result', res.data.result);
                        setColumns(col);
                    }
                    getTableName();
                }
            })
            .catch(error => {
                alert(error.response.data.sqlMessage);
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

    const getColumnName = async () => {
        console.log(textToSql.sql);
        let regexFROM = /(?<=(FROM|from)\s)([^\s|^;]+)/;
        let regexINTO = /(?<=(INTO|into)\s)([^\s|^;]+)/;
        let regexUPDATE = /(?<=(UPDATE|update)\s)([^\s|^;]+)/;
        let result =
            textToSql.sql.match(regexINTO) ||
            textToSql.sql.match(regexFROM) ||
            textToSql.sql.match(regexUPDATE);

        if (result?.length > 0) {
            let filterTableName = tableName?.filter(val => val?.table_name == result[0]);
            if (filterTableName?.length > 0) {
                let res = await axios.get(`${BASE_URL}/getColumnName/${id}/${result[0]}`);
                console.log(res?.data);
                setRecommend(res?.data);
            } else {
                console.log(tableName);
                setRecommend(tableName);
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
                        <div>
                            <h2>
                                <font color="#FFFFFF">Automated SQL Generator System</font>
                            </h2>
                            <font color="#FFFFFF">
                                Faculty of information Technology and Digital Innovation | KMUTNB{' '}
                            </font>
                        </div>
                    </>
                }
                extra={
                    <Space>
                        <div>
                            <img
                                src="../images/button/home_H.png"
                                width="45"
                                height="45"
                                onClick={() => router.push(`/`)}
                            ></img>
                        </div>
                        <div>
                            <img
                                src="../images/button/database_H.png"
                                width="45"
                                height="45"
                                onClick={() => {}}
                            ></img>
                        </div>
                        <div>
                            <img
                                src="../images/button/sqlgenerate_H.png"
                                width="45"
                                height="45"
                                onClick={() => router.push(`/databaseList`)}
                            ></img>
                        </div>
                        <div>
                            <img
                                src="../images/button/myproject_H.png"
                                width="45"
                                height="45"
                                onClick={() => router.push(`/newTable`)}
                            ></img>
                        </div>
                        <div>
                            <img
                                src="../images/button/signOut_H.png"
                                width="45"
                                height="45"
                                onClick={() => {
                                    signOut();
                                }}
                            ></img>
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
                <div style={{ flex: '30%' }}>
                    <div
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
                    >
                        <Space>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* <Input
                                    placeholder="Please enter ..."
                                    value={textToSql.text}
                                    onChange={value => setTextToSql({ ...textToSql, text: value })}
                                    style={{ height: 250, width: 500 }}
                                /> */}
                                <Grid container spacing={1}>
                                    {/* <Grid item md={8} lg={8}>
                                        <TextField
                                            id="outlined-basic"
                                            label=""
                                            variant="outlined"
                                            placeholder="Please enter ..."
                                            value={textToSql.text}
                                            onChange={event =>
                                                setTextToSql({
                                                    ...textToSql,
                                                    text: event.target.value,
                                                })
                                            }
                                            // style={{ height: 250, width: 500 }}
                                        />
                                    </Grid>
                                    <Grid item md={4} lg={4}> */}
                                    <Paper
                                        component="form"
                                        sx={{
                                            p: '2px 4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: 400,
                                        }}
                                    >
                                        <InputBase
                                            sx={{ ml: 1, flex: 1 }}
                                            value={textToSql.text}
                                            placeholder="กรุณากรอกข้อมูล"
                                            inputProps={{ 'aria-label': 'กรุณากรอกข้อมูล' }}
                                            onClick={() => {
                                                if (!textToSql.text) {
                                                    return alert('กรุณากรอกข้อมูล');
                                                } else {
                                                    convertToSql();
                                                }
                                            }}
                                        />
                                        <IconButton
                                            type="button"
                                            sx={{ p: '10px' }}
                                            aria-label="แปลงคำสั่ง"
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                        {/* <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" /> */}
                                    </Paper>
                                    {/* <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<Search />}
                                            onClick={() => {
                                                if (!textToSql.text) {
                                                    return alert('กรุณากรอกข้อมูล');
                                                }
                                                convertToSql();
                                            }}
                                        >
                                            แปลงคำสั่ง
                                        </Button> */}
                                    {/* </Grid> */}
                                </Grid>

                                <Input
                                    placeholder=""
                                    value={textToSql.sql}
                                    onChange={value => setTextToSql({ ...textToSql, sql: value })}
                                    style={{ height: 250, width: 500 }}
                                />
                                <Button
                                    type="primary"
                                    style={{ margin: '10px 0 10px 0' }}
                                    onClick={process}
                                >
                                    ดำเนินการ
                                </Button>
                            </div>
                            <div>
                                {recommend[0]?.column_name && (
                                    <div>
                                        <div>ฟิลด์ที่ตรงกับตาราง</div>
                                        <div style={{ textAlign: 'left' }}>
                                            {/* {recommend.map((val, i) => (
                                                <li>{val?.column_name}</li>
                                            ))} */}
                                        </div>
                                    </div>
                                )}
                                {recommend[0]?.table_name && (
                                    <div>
                                        <div sx={{ color: 'red' }}>
                                            !! กรุณาใส่ชื่อตารางให้ถูกต้อง
                                        </div>
                                        <div>ชื่อตารางที่มี</div>
                                        <div>
                                            {/* {recommend.map((val, i) => (
                                                <li>{val?.table_name}</li>
                                            ))} */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Space>
                        {/* </div> */}
                    </div>
                </div>
                <div style={{ flex: '70%', overflow: 'auto', height: '80vh' }}>
                    {processData.length > 0 ? (
                        <div className="">
                            <DataGrid
                                rows={processData}
                                columns={column}
                                getRowId={row => row.BookID}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 15 },
                                    },
                                }}
                                pageSizeOptions={[5, 10, 15]}
                            />
                        </div>
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
