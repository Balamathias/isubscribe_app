import { COLORS } from '@/constants/colors';
import { useColorScheme } from 'react-native';

export const useThemedColors = () => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = COLORS[theme];

    return {colors, theme};
};