import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { adminAPI } from '../../api';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await adminAPI.getAnalytics();
            setData(response.data);
        } catch (error) {
            // Alert.alert('Error', 'Failed to load analytics data');
            // Fail silently or set empty data handled below
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    const systemStats = data || {};

    // 1. Process Daily Stats (Line Chart)
    const rawDailyStats = data?.dailyStats || [];
    // Ensure at least one data point to prevent chart crash
    const processedDailyStats = rawDailyStats.length > 0
        ? rawDailyStats
        : [{ _id: 'Today', count: 0 }];

    const lineChartData = {
        labels: processedDailyStats.map(d => d._id).slice(-5),
        datasets: [{
            data: processedDailyStats.map(d => d.count || 0).slice(-5)
        }]
    };

    // 2. Process Category Distribution (Pie Chart)
    const rawCategoryDist = data?.categoryDistribution || [];
    const pieChartData = rawCategoryDist.length > 0
        ? rawCategoryDist.map((cat, index) => ({
            name: cat._id || 'Unknown',
            population: cat.count || 0,
            color: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][index % 5],
            legendFontColor: "#ccc",
            legendFontSize: 12
        }))
        : [{
            name: 'No Data',
            population: 1, // Dummy value to render slice
            color: '#2d2d44',
            legendFontColor: "#ccc",
            legendFontSize: 12
        }];

    // 3. Process Success Rate (Progress Chart)
    // Ensure value is between 0 and 1
    const rawSuccessRate = systemStats.tryOns?.successRate || 0;
    const progressValue = Math.min(Math.max(rawSuccessRate / 100, 0), 1);

    // ProgressChart crashes if data is exactly [0] or NaN? 
    // It usually handles 0 fine, but let's be safe.
    const progressData = {
        labels: ["Success", "Fail"],
        data: [progressValue]
    };

    const chartConfig = {
        backgroundGradientFrom: "#1a1a2e",
        backgroundGradientTo: "#1a1a2e",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#6366f1"
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Advanced Analytics</Text>
                    <Text style={styles.subtitle}>Overview of system performance</Text>
                </View>

                {/* Line Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Daily Try-Ons</Text>
                    {processedDailyStats.length > 0 ? (
                        <LineChart
                            data={lineChartData}
                            width={width - 40}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            fromZero
                        />
                    ) : (
                        <Text style={styles.noDataText}>No daily data available</Text>
                    )}
                </View>

                {/* Stats Cards */}
                <View style={styles.row}>
                    <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.cardTitle}>Total Users</Text>
                        <Text style={styles.cardValue}>{systemStats.users?.total || 0}</Text>
                        <Text style={styles.cardSub}>+{systemStats.users?.newToday || 0} today</Text>
                    </View>
                    <View style={[styles.card, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.cardTitle}>Active Garments</Text>
                        <Text style={styles.cardValue}>{systemStats.garments?.active || 0}</Text>
                        <Text style={styles.cardSub}>Total: {systemStats.garments?.total || 0}</Text>
                    </View>
                </View>

                {/* Pie Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Category Distribution</Text>
                    <PieChart
                        data={pieChartData}
                        width={width - 40}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                </View>

                {/* Progress Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Success Rate</Text>
                    <View style={styles.progressContainer}>
                        <ProgressChart
                            data={progressData}
                            width={width - 80}
                            height={160}
                            strokeWidth={16}
                            radius={60}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            }}
                            hideLegend={true}
                        />
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressText}>{Math.round(progressValue * 100)}%</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f23',
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    chartContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
        marginRight: 16,
    },
    noDataText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardTitle: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 8,
    },
    cardSub: {
        fontSize: 12,
        color: '#10b981',
    },
    progressContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    progressTextContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    }
});

export default AnalyticsScreen;
