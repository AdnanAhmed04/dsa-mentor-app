import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Trophy, Flame, Target, ChevronRight, Users, Activity, Zap, Sun, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollToTop } from '@react-navigation/native';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import theme, { darkTheme, lightTheme } from '../utils/theme';
import axios from 'axios';

const DashboardScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { user, token } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useScrollToTop(scrollRef);

  useEffect(() => {
    fetchData();

    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // If we're already on this screen, refetch data
      if (navigation.isFocused()) {
        fetchData();
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    setIsLoading(true);
    if (user?.role === 'admin') {
      await fetchAdminStats();
    } else {
      await fetchProgress();
    }
    setIsLoading(false);
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/submissions/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(response.data.data.progress);
    } catch (err) {
      console.error('Failed to fetch progress', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/topics/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const completedCount = progress.filter(p => p.completionStatus === 'Completed').length;
  const weakTopics = progress.filter(p => p.isWeak);
  const isAdmin = user?.role === 'admin';

  if (isLoading && !progress.length && !stats) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollRef}
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.colors.textPrimary }]}>Hi, {user?.name.split(' ')[0]} 👋</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Ready for today's challenge?</Text>
        </View>
        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border }]}
          onPress={toggleTheme}
        >
          {isDarkMode ? (
            <Sun color={theme.colors.warning} size={22} />
          ) : (
            <Moon color={theme.colors.primary} size={22} />
          )}
        </TouchableOpacity>
      </View>



      <View style={styles.statsRow}>
        {isAdmin ? (
          <>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Users color={theme.colors.primary} size={20} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{stats?.totalUsers || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Trophy color={theme.colors.success} size={20} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{stats?.totalMockTests || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tests</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Activity color={theme.colors.info} size={20} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{stats?.totalAttempts || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Attempts</Text>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Flame color={theme.colors.error} size={20} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{user?.streak || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Trophy color={theme.colors.warning} size={20} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{user?.points || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Target color={theme.colors.info} size={20} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{completedCount}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Solved</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{isAdmin ? 'Admin Quick Actions' : 'Weak Areas'}</Text>
          {!isAdmin && weakTopics.length > 0 && (
            <Text style={styles.sectionBadge}>{weakTopics.length} Focus Areas</Text>
          )}
        </View>

        {!isAdmin ? (
          weakTopics.filter(t => t.topicId).length > 0 ? (
            weakTopics.filter(t => t.topicId).map((topic, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.itemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => navigation.navigate('Topics', { screen: 'TopicDetail', params: { topicId: topic.topicId._id } })}
              >
                <View style={styles.itemContent}>
                  <View style={[styles.itemIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Activity color={theme.colors.error} size={20} />
                  </View>
                  <View>
                    <Text style={[styles.itemName, { color: theme.colors.textPrimary }]}>{topic.topicId.title}</Text>
                    <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>{topic.topicId.difficulty} • Needs review</Text>
                  </View>
                </View>
                <ChevronRight color={theme.colors.textMuted} size={20} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyCard, { borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.4)' }]}>
              <LinearGradient
                colors={isDarkMode ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)'] : ['rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.02)']}
                style={styles.emptyGradient}
              >
                <Trophy color={theme.colors.success} size={32} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>You're doing great! No weak areas yet.</Text>
              </LinearGradient>
            </View>
          )
        ) : (
          <TouchableOpacity 
            style={styles.adminCard}
            onPress={() => navigation.navigate('Admin')}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.adminGradient}
            >
              <View>
                <Text style={styles.adminTitle}>Admin Management</Text>
                <Text style={styles.adminSub}>Manage topics, questions, and users</Text>
              </View>
              <Zap color={theme.colors.white} size={24} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.banner}
        onPress={() => navigation.navigate('MockTest')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isDarkMode ? ['#4f46e5', '#6366f1'] : ['#6366f1', '#818cf8']}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>Take a Mock Test</Text>
            <Text style={styles.bannerSub}>Simulate a real coding interview environment</Text>
            <View style={styles.bannerBtn}>
              <Text style={[styles.bannerBtnText, { color: theme.colors.primary }]}>Start Now</Text>
            </View>
          </View>
          <Trophy color="rgba(255, 255, 255, 0.2)" size={100} style={styles.bannerDecoration} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  themeToggle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    width: '31%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  emptyGradient: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  adminCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  adminGradient: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminTitle: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  adminSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  banner: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 40,
    ...theme.shadows.lg,
  },
  bannerGradient: {
    padding: 24,
    flexDirection: 'row',
    position: 'relative',
  },
  bannerInfo: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
    maxWidth: '80%',
  },
  bannerBtn: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  bannerDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
  }
});

export default DashboardScreen;

