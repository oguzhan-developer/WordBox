import { useEffect, useState, useCallback, useRef } from 'react';

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const initialTimeRef = useRef(null);
    const [lastChangedAt, setLastChangedAt] = useState(null);

    // Initialize time on mount
    useEffect(() => {
        const now = Date.now();
        initialTimeRef.current = now;
        setLastChangedAt(now);
    }, []);

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
