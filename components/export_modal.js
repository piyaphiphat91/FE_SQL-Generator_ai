import { useState, useEffect } from 'react';
import { Modal, Notification, Tabs } from '@arco-design/web-react';
import Editor from '@monaco-editor/react';
import graphState from '../hooks/use-graph-state';
import exportSQL from '../utils/export-sql';
import axios from 'axios';
const BASE_URL = 'http://localhost:3001';

const TabPane = Tabs.TabPane;

/**
 * It's a modal that displays the command to be exported
 * @returns Modal component
 */
export default function ExportModal({ showModal, onCloseModal, name }) {
    const [exportType, setExportType] = useState('mysql');
    const [sqlValue, setSqlValue] = useState('');
    const { tableDict, linkDict, theme } = graphState.useContainer();

    const createSql = async () => {
        // console.log(sqlValue.replace("CREATE"," " "));
        try {
            let createTable = {
                name,
                sql: sqlValue.replaceAll(/`/g, ' '),
            };
            let createSchema = {
                name,
            };
            await axios.post(BASE_URL + '/createSchema', createSchema, {}).then(async () => {
                await axios.post(BASE_URL + '/createTable', createTable, {});
            });

            Notification.success({
                title: 'Export Success',
            });
        } catch (e) {
            console.log(e);
            Notification.error({
                title: 'Copy Failed',
            });
        }
    };

    // const copy = async () => {
    //     try {
    //         console.log(sqlValue);
    //         await window.navigator.clipboard.writeText(sqlValue);
    //         Notification.success({
    //             title: 'Copy Success',
    //         });
    //     } catch (e) {
    //         console.log(e);
    //         Notification.error({
    //             title: 'Copy Failed',
    //         });
    //     }
    // };

    useEffect(() => {
        if (showModal === 'export') {
            const sql = exportSQL(tableDict, linkDict, exportType);
            setSqlValue(sql);
        }
    }, [showModal, exportType]);

    return (
        <Modal
            title={null}
            simple
            visible={showModal === 'export'}
            autoFocus={false}
            onOk={() => createSql()}
            okText="Run To Database Server"
            cancelText="Close"
            onCancel={() => onCloseModal()}
            style={{ width: 'auto' }}
        >
            <Tabs activeTab={exportType} onChange={val => setExportType(val)}>
                {/* <TabPane key="dbml" title="DBML" />
                <TabPane key="postgres" title="PostgreSQL" /> */}
                <TabPane key="mysql" title="MySQL" />
                {/* <TabPane key="mssql" title="MSSQL" /> */}
            </Tabs>
            <Editor
                value={sqlValue}
                language={exportType === 'dbml' ? 'apex' : 'sql'}
                width="680px"
                height="80vh"
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollbar: {
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                    },
                    lineNumbers: 'on',
                }}
            />
        </Modal>
    );
}
