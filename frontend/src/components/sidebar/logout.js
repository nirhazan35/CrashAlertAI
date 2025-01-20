import { useAuth } from "../../authentication/AuthProvider";

const Logout = async () => {
    const { logout } = useAuth();

    try {
        await logout();
    } catch (error) {
        console.error('Logout failed:', error.message);
    }
    }

export default Logout;