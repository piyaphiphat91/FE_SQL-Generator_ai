import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';

const LoaderContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const Loader = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 2s linear infinite;
`;
export default function Layout({ children }) {
    const router = useRouter();
    const { data, status } = useSession();
    console.log(data);

    useEffect(() => {
        const checkAuth = async () => {
            if (status === 'loading') {
                return <></>;
            } else if (!data && router.pathname !== '/authen') {
                router.replace('/authen'); // Redirect to the login page if not logged in
            }
        };
        checkAuth();
    }, [router, data, status]);

    return <>{children}</>;
}
