import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { SoundProvider } from './src/context/SoundContext';
import DiscoverScreen from './src/screens/DiscoverScreen';
import LikesScreen from './src/screens/LikesScreen';
import MatchesScreen, { MatchesStackParamList } from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const MatchesStack = createNativeStackNavigator<MatchesStackParamList>();

function MatchesStackNavigator() {
  return (
    <MatchesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <MatchesStack.Screen
        name="MatchesList"
        component={MatchesScreen}
        options={{ headerShown: false }}
      />
      <MatchesStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerTitle: 'Chat', headerBackTitle: 'Matches' }}
      />
    </MatchesStack.Navigator>
  );
}

function Tabs() {
  const { unreadCount, likesReceived } = useApp();
  return (
    <Tab.Navigator
      // L'app s'ouvre sur le deck de swipe : c'est là qu'on fait des matches.
      initialRouteName="Découvrir"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10.5 },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Découvrir"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="paw" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          tabBarBadge: likesReceived.length > 0 ? likesReceived.length : undefined,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.card },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <SoundProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <Tabs />
          </NavigationContainer>
        </SoundProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
