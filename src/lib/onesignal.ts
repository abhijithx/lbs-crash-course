"use client";

import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

let isOneSignalInitializing = false;

export const useOneSignal = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initOneSignal = async () => {
            const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
            if (!appId) {
                console.warn("OneSignal App ID is not configured");
                return;
            }

            try {
                if (isOneSignalInitializing) return;

                // Check if already initialized to prevent errors
                const isBrowser = typeof window !== "undefined";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const oneSignalObj = isBrowser ? (window as any).OneSignal : undefined;

                if (!oneSignalObj?.initialized) {
                    isOneSignalInitializing = true;
                    await OneSignal.init({
                        appId,
                        allowLocalhostAsSecureOrigin: process.env.NODE_ENV !== "production",
                    });
                    setIsInitialized(true);
                    isOneSignalInitializing = false;
                } else {
                    setIsInitialized(true);
                }
            } catch (error) {
                isOneSignalInitializing = false;
                console.error("Error initializing OneSignal:", error);
            }
        };

        initOneSignal();
    }, []);

    return { isInitialized };
};
