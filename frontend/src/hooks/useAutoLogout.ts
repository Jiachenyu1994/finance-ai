import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AUTO_LOGOUT_TIME = 2 * 60 * 1000; // 15分钟
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000; // 14分钟

export function useAutoLogout() {
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        let warningTimeout: NodeJS.Timeout;
        let logoutTimeout: NodeJS.Timeout;

        const handleLogout = () => {
            // 清理本地存储或任何认证信息
            localStorage.clear();
            navigate("/login");
        };

        const resetTimers = () => {
            if (warningTimeout) clearTimeout(warningTimeout);
            if (logoutTimeout) clearTimeout(logoutTimeout);

            warningTimeout = setTimeout(() => {
                setShowWarning(true);
            }, AUTO_LOGOUT_TIME - WARNING_BEFORE_TIMEOUT);
            
            logoutTimeout = setTimeout(() => {
                handleLogout;
            }, AUTO_LOGOUT_TIME);
        };

        const handleActivity = () => {
            setShowWarning(false);
            resetTimers();
        };

        const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity);
        });
        
        resetTimers();

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (warningTimeout) clearTimeout(warningTimeout);
            if (logoutTimeout) clearTimeout(logoutTimeout);
        };
    }, [navigate]);

    return { showWarning, setShowWarning };
}