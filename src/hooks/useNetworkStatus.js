import { useEffect, useState, useCallback } from 'react';

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [lastChangedAt, setLastChangedAt] = useState(Date.now());

    const updateStatus = useCallback((status) => {
        setIsOnline(status);
        setLastChangedAt(Date.now());
    }, []);

    useEffect(() => {
        const handleOnline = () => updateStatus(true);
        const handleOffline = () => updateStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [updateStatus]);

    return { isOnline, lastChangedAt };
}

export default useNetworkStatus;
