import { useAuth } from "../authentication/AuthProvider";

const Logout = () => {
    const { logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error.message);
        }
    }
    return (
        <button onClick={handleLogout}>Logout</button>
    );
}

export default Logout;