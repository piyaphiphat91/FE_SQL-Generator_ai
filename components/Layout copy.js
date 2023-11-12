import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Layout({ children }) {
    const router = useRouter();
    const { data } = useSession();
    console.log(data);

    useEffect(() => {
        const checkAuth = async () => {
            if (!data && router.pathname != '/authen') {
                router.replace('/authen'); // Redirect to the login page if not logged in
            }
        };
        checkAuth();
    }, [router]);

    return <>{children}</>;
}
