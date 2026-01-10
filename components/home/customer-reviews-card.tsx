import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface CustomerReviewsCardProps {
    onPress: () => void;
}

const CustomerReviewsCard: React.FC<CustomerReviewsCardProps> = ({ onPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = COLORS[isDark ? 'dark' : 'light'];

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            className="rounded-3xl overflow-hidden"
            style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.3 : 0.08,
                shadowRadius: 16,
                elevation: 5,
            }}
        >
            <View className="p-5">
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                        {/* Star Icon with Glow */}
                        <View
                            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: 'rgba(255, 215, 0, 0.12)' }}
                        >
                            <Ionicons name="star" size={22} color="#FFD700" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground font-bold text-lg">
                                Customer Reviews
                            </Text>
                            <Text className="text-muted-foreground text-xs mt-0.5">
                                Tap to see all feedback
                            </Text>
                        </View>
                    </View>

                    {/* Arrow Button */}
                    <View className="w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                    </View>
                </View>

                {/* Stars Preview */}
                <View className="flex-row items-center">
                    <View className="flex-row mr-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                                key={star}
                                name="star"
                                size={16}
                                color={star <= 4 ? '#FFD700' : 'rgba(255,215,0,0.3)'}
                                style={{ marginRight: 2 }}
                            />
                        ))}
                    </View>
                    <Text className="text-muted-foreground text-sm">
                        See what our customers are saying
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CustomerReviewsCard;
