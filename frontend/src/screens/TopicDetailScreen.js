import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ChevronLeft, PlayCircle, Code2, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { API_URL } from '../utils/constants';
import theme from '../utils/theme';

const TopicDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { topicId } = route.params;
// ... existing fetch logic ...
  const { token, user } = useAuthStore();
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState(user?.selectedLanguage || 'Python');

  useEffect(() => {
    fetchTopic();
  }, []);

  const fetchTopic = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics/${topicId}`);
      setTopic(response.data.data.topic);
    } catch (err) {
      console.error('Failed to fetch topic', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Topic not found</Text>
      </View>
    );
  }

  const codeSnippet = topic.codeExamples?.[selectedLang.toLowerCase().replace('++', 'cpp')];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{topic.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentInner, { paddingBottom: 150 }]}
      >
        <Markdown style={markdownStyles}>
          {topic.content}
        </Markdown>

        <View style={styles.codeSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Code2 color={theme.colors.primaryLight} size={20} />
              <Text style={styles.sectionTitle}>Implementation</Text>
            </View>
          </View>
          
          <View style={styles.langTabs}>
            {['Python', 'C++', 'Java'].map(lang => (
              <TouchableOpacity 
                key={lang}
                style={[styles.langTab, selectedLang === lang && styles.activeTab]}
                onPress={() => setSelectedLang(lang)}
              >
                <Text style={[styles.langTabText, selectedLang === lang && styles.activeTabText]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{codeSnippet || '// No example available for this language'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Problems</Text>
          {topic.practiceQuestions?.length > 0 ? (
            topic.practiceQuestions.map((q, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.practiceCard}
              >
                <View style={styles.practiceMain}>
                  <Text style={styles.practiceName}>{q.title}</Text>
                  <View style={styles.practiceMeta}>
                    <Text style={styles.practiceSource}>LeetCode</Text>
                    <View style={styles.dot} />
                    <Text style={styles.practiceDiff}>Medium</Text>
                  </View>
                </View>
                <ExternalLink color={theme.colors.primaryLight} size={18} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>More challenges coming soon!</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <AlertCircle color={theme.colors.error} size={20} />
            <Text style={styles.sectionTitle}>Common Pitfalls</Text>
          </View>
          <View style={styles.mistakesBox}>
            {topic.commonMistakes?.length > 0 ? (
              topic.commonMistakes.map((mistake, i) => (
                <View key={i} style={styles.mistakeItem}>
                  <View style={styles.mistakeBullet} />
                  <Text style={styles.mistakeText}>{mistake}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.mistakeItem}>
                  <View style={styles.mistakeBullet} />
                  <Text style={styles.mistakeText}>Incorrect base case handling in recursion.</Text>
                </View>
                <View style={styles.mistakeItem}>
                  <View style={styles.mistakeBullet} />
                  <Text style={styles.mistakeText}>Not considering empty input scenarios.</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Quiz', { topicId: topic._id })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quizBtn}
          >
            <PlayCircle color={theme.colors.white} size={22} />
            <Text style={styles.quizBtnText}>Start Quiz</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'transparent',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: theme.spacing.lg,
  },
  codeSection: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  langTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: theme.colors.background,
    padding: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  langTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: theme.colors.surfaceLight,
  },
  langTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  activeTabText: {
    color: theme.colors.primaryLight,
  },
  codeBox: {
    backgroundColor: '#0a0f1d',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeText: {
    color: '#9cdcfe',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  practiceCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  practiceMain: {
    flex: 1,
  },
  practiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  practiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  practiceSource: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  practiceDiff: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.textMuted,
    marginHorizontal: 8,
  },
  mistakesBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  mistakeItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mistakeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.error,
    marginTop: 7,
    marginRight: 10,
  },
  mistakeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'transparent',
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    ...theme.shadows.lg,
  },
  quizBtnText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
});

const markdownStyles = {
  body: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
  },
  heading1: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 12,
    fontSize: 24,
  },
  heading2: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
    fontSize: 20,
  },
  paragraph: {
    marginBottom: 16,
  },
  strong: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  list_item: {
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 16,
  },
};

export default TopicDetailScreen;

