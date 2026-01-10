import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const INTRO_SEEN_KEY = '@isubscribe_intro_seen';

interface UseFirstLaunchResult {
    isFirstLaunch: boolean | null;
    isLoading: boolean;
    markAsSeen: () => Promise<void>;
}

/**
 * Custom hook to manage first-launch detection for the intro screen.
 * Uses AsyncStorage to persist whether the user has seen the intro.
 * 
 * @returns {UseFirstLaunchResult} State and methods for first-launch management
 */
export const useFirstLaunch = (): UseFirstLaunchResult => {
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const hasSeenIntro = await AsyncStorage.getItem(INTRO_SEEN_KEY);
                setIsFirstLaunch(hasSeenIntro === null);
            } catch (error) {
                // If AsyncStorage fails, default to showing the intro
                // This ensures first-time users see the intro even if there's an error
                console.warn('Failed to check first launch status:', error);
                setIsFirstLaunch(true);
            } finally {
                setIsLoading(false);
            }
        };

        checkFirstLaunch();
    }, []);

    const markAsSeen = useCallback(async () => {
        try {
            await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
            setIsFirstLaunch(false);
        } catch (error) {
            // Log but don't throw - the app should still work
            console.warn('Failed to mark intro as seen:', error);
        }
    }, []);

    return {
        isFirstLaunch,
        isLoading,
        markAsSeen,
    };
};

export default useFirstLaunch;
