import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import HistoryScreen from './screens/HistoryScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Types for navigation
type RootTabParamList = {
  Home: undefined;
  Add: undefined;
  History: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Custom Tab Bar Icon
const TabIcon = ({ route, focused, color, size }: { route: any; focused: boolean; color: string; size: number }) => {
  let iconName: keyof typeof Ionicons.glyphMap = 'home';
  
  if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
  else if (route.name === 'Add') iconName = focused ? 'add-circle' : 'add-circle-outline';
  else if (route.name === 'History') iconName = focused ? 'list' : 'list-outline';
  else if (route.name === 'Analytics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
  else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

  return <Ionicons name={iconName} size={size} color={color} />;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Paper theme for dark/light support
  const theme = {
    colors: {
      primary: '#10b981',
      background: isDark ? '#111827' : '#f8fafc',
      surface: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f3f4f6' : '#111827',
      onSurface: isDark ? '#f3f4f6' : '#111827',
      error: '#ef4444',
    },
    roundness: 12,
  };

  return (
    <PaperProvider theme={theme as any}>
      <NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => 
              TabIcon({ route, focused, color, size }),
            tabBarActiveTintColor: '#10b981',
            tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
            tabBarStyle: {
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderTopColor: isDark ? '#374151' : '#e5e7eb',
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 64,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ tabBarLabel: 'Dashboard' }}
          />
          <Tab.Screen 
            name="Add" 
            component={AddExpenseScreen} 
            options={{ tabBarLabel: 'Add Expense' }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen} 
            options={{ tabBarLabel: 'History' }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={AnalyticsScreen} 
            options={{ tabBarLabel: 'Analytics' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ tabBarLabel: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
