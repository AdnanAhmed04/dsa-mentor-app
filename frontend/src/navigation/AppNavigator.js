import React, { useRef } from 'react';
import { View, Platform, Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, BookOpen, User, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// State
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { darkTheme, lightTheme } from '../utils/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TopicsListScreen from '../screens/TopicsListScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MockTestScreen from '../screens/MockTestScreen';
import AdminScreen from '../screens/AdminScreen';
import QuizTopicsListScreen from '../screens/QuizTopicsListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabButton = (props) => {
  const { children, onPress } = props;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleValue }], justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const MainTabs = () => {
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#ffffff' : '#3730a3',
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255, 255, 255, 0.75)' : 'rgba(55, 48, 163, 0.65)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          paddingBottom: 0,
        },
        tabBarButton: (props) => <TabButton {...props} />,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: 20,
          right: 20,
          backgroundColor: 'transparent',
          borderRadius: 24,
          height: 66,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
          borderWidth: 1,
          borderColor: theme.colors.glassBorder,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <BlurView
            tint={isDarkMode ? 'dark' : 'light'}
            intensity={70}
            style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]}
          >
            <LinearGradient
              colors={
                isDarkMode
                  ? ['rgba(99, 102, 241, 0.6)', 'rgba(30, 41, 59, 0.85)']
                  : ['rgba(224, 231, 255, 0.85)', 'rgba(255, 255, 255, 0.8)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </BlurView>
        ),
        headerTransparent: true,
        headerTitleStyle: {
          color: theme.colors.textPrimary,
          fontSize: 18,
          fontWeight: '800',
        },
        headerBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(248, 250, 252, 0.7)',
              borderBottomWidth: 0
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTabIcon, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(79, 70, 229, 0.15)' }] : null}>
              <LayoutDashboard color={color} size={22} />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Topics"
        component={TopicsListScreen}
        options={{
          tabBarLabel: 'Topics',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTabIcon, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(79, 70, 229, 0.15)' }] : null}>
              <BookOpen color={color} size={22} />
            </View>
          ),
          headerTitle: 'Course Roadmap',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTabIcon, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(79, 70, 229, 0.15)' }] : null}>
              <User color={color} size={22} />
            </View>
          ),
          headerShown: false,
        }}
      />
      {user?.role === 'admin' && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? [styles.activeTabIcon, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(79, 70, 229, 0.15)' }] : null}>
                <ShieldCheck color={color} size={22} />
              </View>
            ),
            headerShown: false,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { token } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const customTheme = {
    ...DarkTheme,
    dark: isDarkMode,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: 'transparent',
      notification: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="TopicDetail"
              component={TopicDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerTintColor: theme.colors.textPrimary,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerTintColor: theme.colors.textPrimary,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="MockTest"
              component={MockTestScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerTransparent: true,
                headerTintColor: theme.colors.textPrimary,
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="QuizTopicsList"
              component={QuizTopicsListScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_bottom'
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  activeTabIcon: {
    padding: 6,
    borderRadius: 12,
  }
});

export default AppNavigator;



