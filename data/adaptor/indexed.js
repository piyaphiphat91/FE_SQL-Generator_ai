/* Creating a database called graphDB and creating a table called graphs. */
import Dexie from 'dexie';
import { Notification } from '@arco-design/web-react';
import { diffJson } from 'diff';
import { nanoid } from 'nanoid';
import axios from 'axios';

export const db = new Dexie('graphDB');
const BASE_URL = 'http://localhost:3001';

db.version(4).stores({
    graphs: 'id',
    logs: '++id, graphId',
});

export const getAllGraphs = async () => await db.graphs.toArray();

export const getGraph = async id => await db.graphs.get(id);

export const saveGraph = async ({ id, name, tableDict, linkDict, box }, userData = {}) => {
    const now = new Date().valueOf();
    try {
        const data = await db.graphs.get(id);
        await db.graphs.put({
            id,
            tableDict,
            linkDict,
            box,
            name,
            updatedAt: now,
            createdAt: data.createdAt,
        });
        //
        let body = {
            email: userData.user.email,
            id: id,
            table_dict: tableDict,
            link_dict: linkDict,
            box: box,
            name: name,
            updated_at: now,
            created_at: data.createdAt,
        };
        await axios
            .put(BASE_URL + '/updateProjectList', body, {})
            .then(res => {
                console.log('response from node ', res);
                if (res.status == 201) {
                    // alert(res.data.message);
                }
            })
            .catch(error => {
                console.log('error', error);
            });
        //

        const logJson = {
            tableDict: data.tableDict,
            linkDict: data.linkDict,
            name: data.name,
        };

        if (diffJson({ tableDict, linkDict, name }, logJson).length > 1) {
            db.logs.add({
                graphId: id,
                updatedAt: data.updatedAt,
                ...logJson,
            });
        }

        Notification.success({
            title: 'ดำเนินการสำเร็จ',
        });
    } catch (e) {
        Notification.error({
            title: 'เกิดข้อผิดพลาด',
        });
    }
};

export const delGraph = async id => await db.graphs.delete(id);

export const addGraph = async (graph = {}, id = null, userData = null) => {
    const graphId = id || nanoid();
    const now = new Date().valueOf();
    // await db.graphs.add({
    //     ...graph,
    //     id: graphId,
    //     box: {
    //         x: 0,
    //         y: 0,
    //         w: global.innerWidth,
    //         h: global.innerHeight,
    //         clientW: global.innerWidth,
    //         clientH: global.innerHeight,
    //     },
    //     createdAt: now,
    //     updatedAt: now,
    // });

    //
    let body = {
        email: userData.user.email,
        id: graphId,
        table_dict: graph.tableDict,
        link_dict: graph.linkDict,
        box: {
            x: 0,
            y: 0,
            w: global.innerWidth,
            h: global.innerHeight,
            clientW: global.innerWidth,
            clientH: global.innerHeight,
        },
        name: graph.name,
        updated_at: now,
        created_at: now,
        // create_date: new Date(),
        // update_date: new Date(),
        // updated_at: '',
        // created_at: '',
        // create_date: '',
        // update_date: '',
    };
    await axios
        .post(BASE_URL + '/addProjectList', body, {})
        .then(res => {
            console.log('response from node ', res);
            if (res.status == 201) {
                // alert(res.data.message);
            }
        })
        .catch(error => {
            console.log('error', error);
        });
    //
    return graphId;
};

export const getLogs = async id => await db.logs.where('graphId').equals(id).desc().toArray();

export const delLogs = id => db.logs.delete(id);
