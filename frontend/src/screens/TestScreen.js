import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Target, BookOpen, ChevronRight, Activity } from 'lucide-react-native';
import axios from 'axios';
import { useScrollToTop, useFocusEffect } from '@react-navigation/native';

import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { darkTheme, lightTheme } from '../utils/theme';

const TestScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const scrollRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useScrollToTop(scrollRef);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      if (navigation.isFocused()) {
        fetchStats();
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/submissions/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const passRatio = stats?.passFailRatio || 0;
  const passed = stats?.passed || 0;
  const failed = stats?.failed || 0;
  const total = stats?.totalAttempts || 0;
  const strongCount = stats?.strongTopics?.length || 0;
  const weakCount = stats?.weakTopics?.length || 0;

  return (
    <ScrollView 
      ref={scrollRef}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Performance Center</Text>
        <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>Track your quiz and test statistics</Text>
      </View>

      <View style={styles.content}>
        {/* Pass/Fail Overview */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Overall Accuracy</Text>
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.ratioHeader}>
            <View>
              <Text style={[styles.ratioValue, { color: theme.colors.primary }]}>{passRatio.toFixed(1)}%</Text>
              <Text style={[styles.ratioLabel, { color: theme.colors.textSecondary }]}>Pass Rate</Text>
            </View>
            <View style={[styles.totalAttemptsBadge, { backgroundColor: theme.colors.primary + '15' }]}>
              <Activity color={theme.colors.primary} size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.totalAttemptsText, { color: theme.colors.primary }]}>{total} Attempts</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.error + '40' }]}>
              <View style={[styles.progressFill, { width: `${passRatio}%`, backgroundColor: theme.colors.success }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressText, { color: theme.colors.success }]}>{passed} Passed</Text>
              <Text style={[styles.progressText, { color: theme.colors.error }]}>{failed} Failed</Text>
            </View>
          </View>
        </View>

        {/* Strong/Weak Areas */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 24 }]}>Topic Mastery</Text>
        <View style={styles.row}>
          <View style={[styles.halfCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.success + '15' }]}>
              <TrendingUp color={theme.colors.success} size={24} />
            </View>
            <Text style={[styles.countValue, { color: theme.colors.textPrimary }]}>{strongCount}</Text>
            <Text style={[styles.countLabel, { color: theme.colors.textSecondary }]}>Strong Topics</Text>
          </View>
          <View style={[styles.halfCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.error + '15' }]}>
              <TrendingDown color={theme.colors.error} size={24} />
            </View>
            <Text style={[styles.countValue, { color: theme.colors.textPrimary }]}>{weakCount}</Text>
            <Text style={[styles.countLabel, { color: theme.colors.textSecondary }]}>Weak Topics</Text>
          </View>
        </View>

        {/* Action Cards */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 24 }]}>Take a Test</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('QuizTopicsList')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDarkMode ? ['rgba(99, 102, 241, 0.15)', 'rgba(79, 70, 229, 0.05)'] : ['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.02)']}
            style={[styles.actionGradient, { borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)' }]}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary }]}>
                <BookOpen color={theme.colors.white} size={24} />
              </View>
              <View style={styles.actionTexts}>
                <Text style={[styles.actionTitle, { color: theme.colors.textPrimary }]}>Topic Wise Quiz</Text>
                <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>Practice specific data structures and algorithms</Text>
              </View>
            </View>
            <ChevronRight color={theme.colors.primary} size={24} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('MockTest')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDarkMode ? ['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)'] : ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.02)']}
            style={[styles.actionGradient, { borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)' }]}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.success }]}>
                <Target color={theme.colors.white} size={24} />
              </View>
              <View style={styles.actionTexts}>
                <Text style={[styles.actionTitle, { color: theme.colors.textPrimary }]}>Full Mock Test</Text>
                <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>Simulate a comprehensive interview environment</Text>
              </View>
            </View>
            <ChevronRight color={theme.colors.success} size={24} />
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 15,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ratioValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  totalAttemptsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalAttemptsText: {
    fontWeight: '700',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  countValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderWidth: 1,
    borderRadius: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTexts: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSub: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default TestScreen;
