import { Button, Space, Popconfirm, Input, Switch, Dropdown, Menu } from '@arco-design/web-react';
import { IconSunFill, IconMoonFill, IconLeft } from '@arco-design/web-react/icon';
import Link from 'next/link';
import graphState from '../hooks/use-graph-state';
import tableModel from '../hooks/table-model';
import axios from 'axios';
import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import { PageHeader } from '@arco-design/web-react';
import { useRouter } from 'next/router';
import HouseIcon from '@mui/icons-material/House';

/**
 * It renders a nav bar with a title, a save button, a demo button, a clear button, an export button,
 * and a name input
 * @param props - the props passed to the component
 * @returns A Nav component that takes in a title, a save button, a demo button, a clear button, an export button
 */
export default function Nav({ setShowModal, setShowDrawer }) {
    const router = useRouter;
    const { name, setName, theme, setTheme, setTableDict, setLinkDict, version } =
        graphState.useContainer();
    const { updateGraph, addTable, applyVersion } = tableModel();
    const { data: dataSession } = useSession();
    if (version !== 'currentVersion') {
        return (
            <nav className="nav">
                <div className="nav-title">Logs Record: {name}</div>
                <Space>
                    <Button
                        onClick={() => updateGraph()}
                        type="primary"
                        status="success"
                        shape="round"
                        style={{ marginLeft: 8 }}
                    >
                        Apply Select Version
                    </Button>
                    <Button
                        onClick={() => applyVersion('currentVersion')}
                        shape="round"
                        style={{ marginLeft: 8 }}
                    >
                        Exit Logs View
                    </Button>
                </Space>
            </nav>
        );
    }

    return (
        <nav className="nav" class="col-sm-12">
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
                    <a href="/">
                        <img
                            style={{
                                width: '75px',
                                height: '50px',
                            }}
                            alt="itd"
                            src="/images/itd-logo.png"
                        />
                    </a>
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
                                            marginBottom: 1,
                                            color: '#FFFFFF',
                                        }}
                                    />
                                    <div style={{ color: '#FFFFFF' }}>/Home/DATABASE GENERATOR</div>
                                </div>
                                {/* <font color="#FFFFFF">ข้อความใหม่ที่ต้องการเพิ่ม3</font> */}
                            </div>
                        </div>
                    </>
                }
                extra={
                    <Space>
                        <div>
                            <br></br>
                            <br></br>
                        </div>
                        <div>
                            <Input
                                placeholder="กรุณาระบุชื่อของฐานข้อมูล"
                                value={name}
                                onChange={e => {
                                    setName(e);
                                }}
                            />

                            <div
                                style={{
                                    width: '100%',
                                    position: 'sticky',
                                    zIndex: 15,
                                    fontSize: 16,
                                    color: '#FFFFFF',
                                    textAlign: 'center',
                                }}
                            >
                                Schema Name
                            </div>
                        </div>
                        <div>
                            <center>
                                <a href="#">
                                    <img
                                        src="../images/button/SAVE.png"
                                        width="45"
                                        height="45"
                                        onClick={() => updateGraph()}
                                    ></img>
                                </a>
                                <a href="#">
                                    <img
                                        src="../images/button/NewTable.png"
                                        width="45"
                                        height="45"
                                        onClick={() => addTable()}
                                    ></img>
                                </a>
                                <a href="#">
                                    <img
                                        src="../images/button/ImportSQL.png"
                                        width="45"
                                        height="45"
                                        onClick={() => setShowModal('import')}
                                    ></img>
                                </a>
                                <a href="#">
                                    <img
                                        src="../images/button/Export.png"
                                        width="45"
                                        height="45"
                                        onClick={() => setShowModal('export')}
                                    ></img>
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
            <br></br>
        </nav>
    );
}
