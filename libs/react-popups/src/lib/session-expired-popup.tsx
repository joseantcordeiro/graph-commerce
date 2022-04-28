import { useEffect } from "react";
import { redirectToAuth } from "supertokens-auth-react/recipe/emailpassword";

export function SessionExpiredPopup() {
    useEffect(() => {
        window.alert("Session Expired. Please login again");
        redirectToAuth();
    }, []);

    return null;
}

export default SessionExpiredPopup;
