import { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

const SPLASH_BG = '#0f172a';

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => setSplashVisible(false));
    }, 1400);
    return () => clearTimeout(timer);
  }, [fade]);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
      {splashVisible && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.splash, { opacity: fade }]}
        >
          <View style={styles.iconCircle}>
            <Image
              source={require('./app_icon.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    backgroundColor: SPLASH_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: SPLASH_BG,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
});
