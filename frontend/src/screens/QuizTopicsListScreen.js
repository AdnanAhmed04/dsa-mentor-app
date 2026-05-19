import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { Book, ChevronRight, Search } from 'lucide-react-native';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { darkTheme, lightTheme } from '../utils/theme';

const QuizTopicsListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('/topics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data.data.topics);
    } catch (err) {
      console.error('Failed to fetch topics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Beginner': return theme.colors.success;
      case 'Intermediate': return theme.colors.warning;
      case 'Advanced': return theme.colors.error;
      default: return theme.colors.textMuted;
    }
  };

  const renderTopicItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.topicCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Quiz', { topicId: item._id })}
      >
        <View style={styles.topicInfo}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
            <Book color={theme.colors.primary} size={22} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.topicTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '15' }]}>
                <Text style={[styles.diffText, { color: getDifficultyColor(item.difficulty) }]}>{item.difficulty}</Text>
              </View>
              <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                {item.questions ? item.questions.length : 0} Questions
              </Text>
            </View>
          </View>
        </View>
        <ChevronRight color={theme.colors.textMuted} size={20} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight color={theme.colors.textPrimary} size={28} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Select Topic</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Choose a topic to start quiz</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Search color={theme.colors.textSecondary} size={24} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={topics}
        renderItem={renderTopicItem}
        keyExtractor={item => item._id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No topics found</Text>
          </View>
        }
      />
    </View>
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
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  topicCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  topicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default QuizTopicsListScreen;
