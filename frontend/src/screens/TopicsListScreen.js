import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, StatusBar } from 'react-native';
import { Book, ChevronRight, CheckCircle2, Circle, Edit3, Trash2, AlertTriangle } from 'lucide-react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import theme, { darkTheme, lightTheme } from '../utils/theme';

const TopicsListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      if (navigation.isFocused()) {
        fetchData();
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsubscribe;
  }, [navigation]);

// ... existing fetchData ...
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [topicsRes, progressRes] = await Promise.all([
        axios.get('/topics'),
        axios.get('/submissions/progress', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setTopics(topicsRes.data.data.topics);
      
      const progressMap = {};
      progressRes.data.data.progress.forEach(p => {
        if (p.topicId && p.topicId._id) {
          progressMap[p.topicId._id] = { status: p.completionStatus, isWeak: p.isWeak };
        }
      });
      setProgress(progressMap);
    } catch (err) {
      console.error('Failed to fetch topics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTopicItem = ({ item, index }) => {
    const entry = progress[item._id];
    const status = entry?.status || 'Not Started';
    const needsRevision = !!entry?.isWeak;
    const isCompleted = status === 'Completed' && !needsRevision;
    const displayStatus = needsRevision ? 'Needs Revision' : status;
    const isAdmin = user?.role === 'admin';

    const handleDeleteTopic = (id) => {
      Alert.alert(
        'Delete Topic',
        'Are you sure you want to delete this topic and all its content?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                await axios.delete(`/topics/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
              } catch (err) {
                Alert.alert('Error', 'Failed to delete topic');
              }
            }
          }
        ]
      );
    };

    const handleEditTopic = (topic) => {
      navigation.navigate('Admin', { editingTopic: topic });
    };

    const getDifficultyColor = (diff) => {
      switch(diff) {
        case 'Beginner': return theme.colors.success;
        case 'Intermediate': return theme.colors.warning;
        case 'Advanced': return theme.colors.error;
        default: return theme.colors.textMuted;
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.topicCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TopicDetail', { topicId: item._id })}
      >
        <View style={styles.topicInfo}>
          <View style={[styles.iconContainer, { backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
            <Book color={isCompleted ? theme.colors.success : theme.colors.primary} size={22} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.topicTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '15' }]}>
                <Text style={[styles.diffText, { color: getDifficultyColor(item.difficulty) }]}>{item.difficulty}</Text>
              </View>
              {!isAdmin && (
                <Text style={[
                  styles.statusText,
                  needsRevision
                    ? { color: theme.colors.warning }
                    : isCompleted
                      ? { color: theme.colors.success }
                      : { color: theme.colors.textSecondary }
                ]}>
                  {displayStatus}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          {isAdmin ? (
            <View style={styles.adminActions}>
              <TouchableOpacity style={styles.adminBtn} onPress={() => handleEditTopic(item)}>
                <Edit3 color={theme.colors.primary} size={18} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminBtn} onPress={() => handleDeleteTopic(item._id)}>
                <Trash2 color={theme.colors.error} size={18} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.userActions}>
              {needsRevision ? (
                <AlertTriangle color={theme.colors.warning} size={22} />
              ) : isCompleted ? (
                <CheckCircle2 color={theme.colors.success} size={22} />
              ) : (
                <Circle color={theme.colors.border} size={22} />
              )}
              <ChevronRight color={theme.colors.textMuted} size={18} style={{ marginLeft: 4 }} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>DSA Roadmap</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Master data structures step-by-step</Text>
        </View>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={topics}
        renderItem={renderTopicItem}
        keyExtractor={item => item._id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
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
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  topicCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textPrimary,
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
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  actionContainer: {
    marginLeft: 10,
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});

export default TopicsListScreen;

