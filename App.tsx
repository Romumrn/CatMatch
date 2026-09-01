import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import DiscoverScreen from './src/screens/DiscoverScreen';
import MatchesScreen, { MatchesStackParamList } from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const MatchesStack = createNativeStackNavigator<MatchesStackParamList>();

function MatchesStackNavigator() {
  return (
    <MatchesStack.Navigator>
      <MatchesStack.Screen
        name="MatchesList"
        component={MatchesScreen}
        options={{ headerShown: false }}
      />
      <MatchesStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerTitle: `Chat`,
          headerTintColor: colors.primary,
          headerBackTitle: 'Matches',
        })}
      />
    </MatchesStack.Navigator>
  );
}

function MatchesTabIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="chatbubbles" size={size} color={color} />;
}

function Tabs() {
  const { matches } = useApp();
  return (
    <Tab.Navigator
      initialRouteName="Profil"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Découvrir"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesStackNavigator}
        options={{
          tabBarIcon: MatchesTabIcon,
          tabBarBadge: matches.length > 0 ? matches.length : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Tabs />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
