import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGetAnalytics } from '@/services/api-hooks';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';

const TransactionAnalytics = () => {
    const { colors } = useThemedColors();

    const { data: response, isLoading } = useGetAnalytics();
    const analytics = response?.data;
    const [chartType, setChartType] = React.useState<'category' | 'trend'>('category');

    if (isLoading) {
        return (
            <View className="h-48 items-center justify-center">
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (!analytics || (analytics.total_spent === 0 && analytics.by_category.length === 0)) {
        // No data state
        return null;
    }

    const pieData = analytics.by_category.map(cat => ({
        value: cat.value,
        color: cat.color,
        text: `₦${(cat.value / 1000).toFixed(0)}k`,
        shiftTextX: -10,
        shiftTextY: -5,
    }));

    const barData = analytics.monthly_trend.map((item) => ({
        value: item.value,
        label: item.label,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: { color: colors.foreground, fontSize: 10 },
        frontColor: colors.primary,
    }));

    // Calculate max value for bar chart to adjust height scale
    const maxValue = Math.max(...analytics.monthly_trend.map(m => m.value), 1000);

    return (
        <View className="bg-card mb-6 rounded-2xl p-4 shadow-sm border border-border">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-sm text-muted-foreground font-medium">Total Spent</Text>
                    <Text className="text-2xl font-bold text-foreground">
                        {analytics.currency}{analytics.total_spent.toLocaleString()}
                    </Text>
                </View>

                <View className="flex-row bg-muted rounded-lg p-1">
                    <TouchableOpacity
                        onPress={() => setChartType('category')}
                        className={`px-3 py-1.5 rounded-md ${chartType === 'category' ? 'bg-background shadow-sm' : ''}`}
                    >
                        <Ionicons name="pie-chart" size={16} color={chartType === 'category' ? colors.primary : colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setChartType('trend')}
                        className={`px-3 py-1.5 rounded-md ${chartType === 'trend' ? 'bg-background shadow-sm' : ''}`}
                    >
                        <Ionicons name="bar-chart" size={16} color={chartType === 'trend' ? colors.primary : colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="items-center justify-center min-h-[220px]">
                {chartType === 'category' ? (
                    <View className="flex-row w-full items-center justify-between">
                        <View className="items-center justify-center">
                            <PieChart
                                data={pieData}
                                donut
                                sectionAutoFocus
                                radius={70}
                                innerRadius={50}
                                innerCircleColor={colors.background}
                                centerLabelComponent={() => {
                                    return (
                                        <View className="justify-center items-center">
                                            <Text className="text-xl font-bold text-foreground">
                                                {analytics.by_category.length}
                                            </Text>
                                            <Text className="text-xs text-muted-foreground">Services</Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>

                        <View className="flex-1 ml-4 gap-y-2">
                            {analytics.by_category.slice(0, 4).map((cat, idx) => (
                                <View key={idx} className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View style={{ backgroundColor: cat.color }} className="w-2.5 h-2.5 rounded-full mr-2" />
                                        <Text className="text-xs text-foreground font-medium" numberOfLines={1}>{cat.name}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-xs text-foreground font-semibold">
                                            {analytics.currency}{cat.value.toLocaleString()}
                                        </Text>
                                        <Text className="text-xs text-muted-foreground">
                                            {Math.round((cat.value / analytics.total_spent) * 100)}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="w-full pl-2">
                        <BarChart
                            data={barData}
                            barWidth={22}
                            spacing={20}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: colors.mutedForeground }}
                            noOfSections={4}
                            maxValue={maxValue * 1.2}
                        />
                    </View>
                )}
            </View>

            <View className="mt-6 gap-y-3">
                <Text className="text-sm font-semibold text-foreground mb-2">Detailed Breakdown</Text>
                {analytics.by_category.map((cat, idx) => (
                    <View key={idx} className="flex-row items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <View className="flex-row items-center">
                            <View style={{ backgroundColor: cat.color }} className="w-3 h-3 rounded-full mr-3" />
                            <Text className="text-sm text-foreground font-medium">{cat.name}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-sm font-bold text-foreground">
                                {analytics.currency}{cat.value.toLocaleString()}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                                {Math.round((cat.value / analytics.total_spent) * 100)}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default TransactionAnalytics;
