const notifyPasswordChange = async (token, user, newPassword) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/notify-password-change`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({ token, newPassword }),
        });

        if (response.ok) {
            return true;
        } else {
        const errorData = await response.json();
        throw new Error(`Failed to send notification: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Failed to send password change notification:", error);
        throw error;
    }
}
export default notifyPasswordChange;