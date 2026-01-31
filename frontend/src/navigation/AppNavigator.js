import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import GarmentGalleryScreen from '../screens/main/GarmentGalleryScreen';
import GarmentDetailScreen from '../screens/main/GarmentDetailScreen';
import TryOnScreen from '../screens/main/TryOnScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import TryOnDetailScreen from '../screens/admin/TryOnDetailScreen';
import GarmentManagementScreen from '../screens/admin/GarmentManagementScreen';
import SystemLogsScreen from '../screens/admin/SystemLogsScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0f0f23' },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
    >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
    const { isAdmin } = useAuth();
    const { bottom } = useSafeAreaInsets();

    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={({ route }) => ({
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    backgroundColor: '#1a1a2e',
                    borderTopWidth: 1,
                    borderTopColor: '#2d2d44',
                    paddingBottom: bottom > 0 ? bottom : 10,
                    paddingTop: 5,
                    height: 60 + (bottom > 0 ? bottom - 10 : 0),
                },
                tabBarIndicatorStyle: {
                    backgroundColor: '#6366f1',
                    top: 0,
                    height: 2,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    textTransform: 'none',
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    const size = 24;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Gallery') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'TryOn') {
                        iconName = focused ? 'shirt' : 'shirt-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Admin') {
                        iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                swipeEnabled: true,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Gallery"
                component={GarmentGalleryScreen}
                options={{ tabBarLabel: 'Gallery' }}
            />
            <Tab.Screen
                name="TryOn"
                component={TryOnScreen}
                options={{ tabBarLabel: 'Try-On' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminDashboardScreen}
                    options={{ tabBarLabel: 'Admin' }}
                />
            )}
        </Tab.Navigator>
    );
};

// Main Stack with Settings and Admin screens
const MainStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: '600',
            },
            cardStyle: { backgroundColor: '#0f0f23' },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
    >
        <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
        />
        <Stack.Screen
            name="UserManagement"
            component={UserManagementScreen}
            options={{ title: 'User Management' }}
        />
        <Stack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={{ title: 'User Profile' }}
        />
        <Stack.Screen
            name="TryOnDetail"
            component={TryOnDetailScreen}
            options={{ title: 'Try-On Detail' }}
        />
        <Stack.Screen
            name="GarmentManagement"
            component={GarmentManagementScreen}
            options={{ title: 'Garment Management' }}
        />
        <Stack.Screen
            name="SystemLogs"
            component={SystemLogsScreen}
            options={{ title: 'System Logs' }}
        />
        <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{ title: 'Analytics' }}
        />
        <Stack.Screen
            name="GarmentSelection"
            component={GarmentGalleryScreen}
            options={{ title: 'Select Garment' }}
        />
        <Stack.Screen
            name="GarmentDetail"
            component={GarmentDetailScreen}
            options={{ title: 'Garment Details' }}
        />
        <Stack.Screen
            name="TryOnStack"
            component={TryOnScreen}
            options={{ title: 'Virtual Try-On' }}
        />
    </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' }}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
