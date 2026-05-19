import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, Modal, StatusBar } from 'react-native';
import { PlusCircle, Save, Trash2, Users, FileText, Trophy, Activity, LayoutDashboard, BookOpen, PenTool, ChevronRight, X, MessageCircle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import theme from '../utils/theme';
import { API_URL } from '../utils/constants';

const AdminScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
// ... existing state and logic ...
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [editingTopicId, setEditingTopicId] = useState(null);

  React.useEffect(() => {
    if (route.params?.editingTopic) {
      const topic = route.params.editingTopic;
      setActiveTab('topic');
      setEditingTopicId(topic._id);
      setTitle(topic.title);
      setDescription(topic.description);
      setDifficulty(topic.difficulty);
      setContent(topic.content);
      navigation.setParams({ editingTopic: null });
    }
  }, [route.params?.editingTopic]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMockTests: 0,
    totalQuizzes: 0,
    totalAttempts: 0
  });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [content, setContent] = useState('');

  const [mtTitle, setMtTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [mtQuestions, setMtQuestions] = useState([]);
  
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState('');

  const [mockTests, setMockTests] = useState([]);
  const [isMtLoading, setIsMtLoading] = useState(false);

  const [supportMessages, setSupportMessages] = useState([]);
  const [isSupportLoading, setIsSupportLoading] = useState(false);
  const [editingMtId, setEditingMtId] = useState(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTestTitle, setModalTestTitle] = useState('');
  const [modalDuration, setModalDuration] = useState('30');
  const [modalQuestions, setModalQuestions] = useState([]);
  const [editingQIdx, setEditingQIdx] = useState(null);

  React.useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'mocktest') {
      fetchMockTests();
    } else if (activeTab === 'support') {
      fetchSupportMessages();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await axios.get('/topics/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchSupportMessages = async () => {
    setIsSupportLoading(true);
    try {
      const res = await axios.get(`${API_URL}/support/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupportMessages(res.data.data.messages);
    } catch (err) {
      console.error('Failed to fetch support messages', err);
    } finally {
      setIsSupportLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/support/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupportMessages(prev =>
        prev.map(m => m._id === id ? { ...m, isRead: true } : m)
      );
    } catch {
      Alert.alert('Error', 'Could not mark as read.');
    }
  };

  const fetchMockTests = async () => {
    setIsMtLoading(true);
    try {
      const response = await axios.get('/topics/mock-test', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMockTests(response.data.data.mockTests);
    } catch (err) {
      console.error('Failed to fetch mock tests', err);
    } finally {
      setIsMtLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!title || !description || !content) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const payload = {
        title,
        description,
        difficulty,
        content,
        codeExamples: { python: '', cpp: '', java: '' }
      };

      if (editingTopicId) {
        await axios.patch(`/topics/${editingTopicId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Topic updated successfully!');
      } else {
        await axios.post('/topics', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Topic created successfully!');
      }
      
      setTitle('');
      setDescription('');
      setContent('');
      setEditingTopicId(null);
      if (activeTab === 'dashboard') fetchStats();
    } catch (err) {
      Alert.alert('Error', `Failed to ${editingTopicId ? 'update' : 'create'} topic.`);
    }
  };

  const addQuestion = () => {
    if (!qText || options.some(opt => !opt)) {
      Alert.alert('Error', 'Please fill all question fields');
      return;
    }
    const newQ = {
      questionText: qText,
      options: [...options],
      correctAnswer: correctIdx,
      explanation,
      type: 'MCQ'
    };
    setMtQuestions([...mtQuestions, newQ]);
    setQText('');
    setOptions(['', '', '', '']);
    setCorrectIdx(0);
    setExplanation('');
  };

  const handleCreateMockTest = async () => {
    if (!mtTitle || mtQuestions.length === 0) {
      Alert.alert('Error', 'Title and at least one question required');
      return;
    }

    try {
      const payload = {
        title: mtTitle,
        duration: parseInt(duration),
        questions: mtQuestions,
        totalMarks: mtQuestions.length * 2
      };

      if (editingMtId) {
        await axios.patch(`/topics/mock-test/${editingMtId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Mock Test updated successfully!');
      } else {
        await axios.post('/topics/mock-test', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Mock Test created successfully!');
      }
      
      setMtTitle('');
      setMtQuestions([]);
      setEditingMtId(null);
      fetchMockTests();
      if (activeTab === 'dashboard') fetchStats();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      Alert.alert('Error', `Failed to save mock test: ${errorMsg}`);
    }
  };

  const handleEditMt = (test) => {
    setEditingMtId(test._id);
    setModalTestTitle(test.title);
    setModalDuration(test.duration.toString());
    setModalQuestions([...test.questions]);
    setIsModalVisible(true);
    setEditingQIdx(null);
  };

  const handleUpdateMockTest = async () => {
    if (!modalTestTitle || modalQuestions.length === 0) {
      Alert.alert('Error', 'Title and at least one question required');
      return;
    }

    try {
      const payload = {
        title: modalTestTitle,
        duration: parseInt(modalDuration),
        questions: modalQuestions,
        totalMarks: modalQuestions.length * 2
      };

      await axios.patch(`/topics/mock-test/${editingMtId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Mock Test updated successfully!');
      setIsModalVisible(false);
      fetchMockTests();
      if (activeTab === 'dashboard') fetchStats();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      Alert.alert('Error', `Failed to update mock test: ${errorMsg}`);
    }
  };

  const handleEditQuestionInModal = (index) => {
    const q = modalQuestions[index];
    setQText(q.questionText);
    setOptions([...q.options]);
    setCorrectIdx(q.correctAnswer);
    setExplanation(q.explanation || '');
    setEditingQIdx(index);
  };

  const saveQuestionToModal = () => {
    if (!qText || options.some(opt => !opt)) {
      Alert.alert('Error', 'Please fill all question fields');
      return;
    }

    const updatedQ = {
      questionText: qText,
      options: [...options],
      correctAnswer: correctIdx,
      explanation,
      type: 'MCQ'
    };

    const newQs = [...modalQuestions];
    if (editingQIdx !== null) {
      newQs[editingQIdx] = updatedQ;
    } else {
      newQs.push(updatedQ);
    }

    setModalQuestions(newQs);
    setEditingQIdx(null);
    setQText('');
    setOptions(['', '', '', '']);
    setCorrectIdx(0);
    setExplanation('');
  };

  const handleDeleteMt = async (id) => {
    Alert.alert(
      'Delete Mock Test',
      'Are you sure you want to delete this mock test?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/topics/mock-test/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchMockTests();
              Alert.alert('Success', 'Mock test deleted');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete mock test');
            }
          }
        }
      ]
    );
  };

  const StatItem = ({ icon: Icon, label, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Management Hub</Text>
        <Text style={styles.headerSubtitle}>Curate content & monitor analytics</Text>
      </View>


      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'topic', label: 'Add Topic', icon: BookOpen },
            { id: 'mocktest', label: 'Mock Tests', icon: PenTool },
            { id: 'support', label: 'Support', icon: MessageCircle }
          ].map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]} 
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.icon color={activeTab === tab.id ? theme.colors.primaryLight : theme.colors.textMuted} size={18} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Global Analytics</Text>
            <View style={styles.statsGrid}>
              <StatItem icon={Users} label="Total Students" value={stats.totalUsers} color={theme.colors.primaryLight} />
              <StatItem icon={Trophy} label="Mock Tests" value={stats.totalMockTests} color={theme.colors.warning} />
              <StatItem icon={FileText} label="Total Quizzes" value={stats.totalQuizzes} color={theme.colors.success} />
              <StatItem icon={Activity} label="Total Attempts" value={stats.totalAttempts} color={theme.colors.error} />
            </View>
          </View>
        )}

        {activeTab === 'topic' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingTopicId ? 'Update Topic' : 'New Knowledge Module'}</Text>
            
            <View style={styles.inputBox}>
              <Text style={styles.label}>Topic Title</Text>
              <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle} 
                placeholder="e.g. Dynamic Programming"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>Overview Description</Text>
              <TextInput 
                style={styles.input} 
                value={description} 
                onChangeText={setDescription} 
                placeholder="A high-level summary..."
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>Complexity Level</Text>
              <View style={styles.diffRow}>
                {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
                    onPress={() => setDifficulty(d)}
                  >
                    <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>Core Content (Markdown)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={content} 
                onChangeText={setContent} 
                placeholder="# Introduction..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={8}
              />
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={handleCreateTopic}>
              <LinearGradient
                colors={[theme.colors.success, '#059669']}
                style={styles.actionBtn}
              >
                <PlusCircle color="#fff" size={20} />
                <Text style={styles.actionBtnText}>{editingTopicId ? 'Save Changes' : 'Publish Topic'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {editingTopicId && (
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => {
                  setEditingTopicId(null);
                  setTitle('');
                  setDescription('');
                  setContent('');
                }}
              >
                <Text style={styles.cancelBtnText}>Discard Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 'mocktest' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Mock Test Architect</Text>
            
            <View style={styles.inputBox}>
              <Text style={styles.label}>Assessment Title</Text>
              <TextInput 
                style={styles.input} 
                value={mtTitle} 
                onChangeText={setMtTitle} 
                placeholder="e.g. Advanced DSA Challenge"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput 
                style={styles.input} 
                value={duration} 
                onChangeText={setDuration} 
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.qBuilderBox}>
              <Text style={styles.qBuilderTitle}>Question Builder</Text>
              <TextInput 
                style={styles.input} 
                value={qText} 
                onChangeText={setQText} 
                placeholder="Enter question text..."
                placeholderTextColor={theme.colors.textMuted}
              />
              
              <View style={styles.optionsList}>
                {options.map((opt, i) => (
                  <View key={i} style={styles.optEntry}>
                    <TouchableOpacity onPress={() => setCorrectIdx(i)} style={[styles.radio, correctIdx === i && styles.radioActive]} />
                    <TextInput 
                      style={[styles.input, styles.optInput]} 
                      value={opt} 
                      onChangeText={(text) => {
                        const newOpts = [...options];
                        newOpts[i] = text;
                        setOptions(newOpts);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                ))}
              </View>

              <TextInput 
                style={[styles.input, { height: 60, marginTop: 12 }]} 
                value={explanation} 
                onChangeText={setExplanation} 
                placeholder="Rationale / Explanation"
                placeholderTextColor={theme.colors.textMuted}
                multiline
              />

              <TouchableOpacity style={styles.addToListBtn} onPress={addQuestion}>
                <PlusCircle color={theme.colors.primaryLight} size={18} />
                <Text style={styles.addToListText}>Add to Question Set</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.currentQs}>
              <Text style={styles.label}>Questions in Set ({mtQuestions.length})</Text>
              {mtQuestions.map((q, i) => (
                <View key={i} style={styles.qListItem}>
                  <Text style={styles.qListText} numberOfLines={1}>{i+1}. {q.questionText}</Text>
                  <TouchableOpacity onPress={() => setMtQuestions(mtQuestions.filter((_, idx) => idx !== i))}>
                    <Trash2 color={theme.colors.error} size={18} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={handleCreateMockTest}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.actionBtn}
              >
                <Save color="#fff" size={20} />
                <Text style={styles.actionBtnText}>Finalize Assessment</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.existingTests}>
              <Text style={styles.sectionTitle}>Existing Assessments</Text>
              {isMtLoading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                mockTests.map((test) => (
                  <TouchableOpacity key={test._id} style={styles.testCard} onPress={() => handleEditMt(test)}>
                    <View style={styles.testCardInfo}>
                      <Text style={styles.testCardTitle}>{test.title}</Text>
                      <Text style={styles.testCardMeta}>{test.questions.length} Questions • {test.duration} Min</Text>
                    </View>
                    <View style={styles.testCardActions}>
                      <TouchableOpacity style={styles.testActionBtn} onPress={() => handleDeleteMt(test._id)}>
                        <Trash2 color={theme.colors.error} size={18} />
                      </TouchableOpacity>
                      <ChevronRight color={theme.colors.textMuted} size={20} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}
        
        {activeTab === 'support' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>User Support Messages</Text>
            {isSupportLoading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
            ) : supportMessages.length === 0 ? (
              <View style={styles.emptySupport}>
                <MessageCircle color={theme.colors.textMuted} size={40} />
                <Text style={styles.emptySupportText}>No support messages yet</Text>
              </View>
            ) : (
              supportMessages.map((msg) => (
                <View key={msg._id} style={[styles.supportCard, msg.isRead && styles.supportCardRead]}>
                  <View style={styles.supportCardTop}>
                    <View style={styles.supportUserInfo}>
                      <Text style={styles.supportUserName}>{msg.userId?.name || 'Unknown'}</Text>
                      <Text style={styles.supportUserEmail}>{msg.userId?.email}</Text>
                    </View>
                    <View style={styles.supportCardRight}>
                      {!msg.isRead && <View style={styles.unreadDot} />}
                      <Text style={styles.supportTime}>
                        {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.supportMessage}>{msg.message}</Text>
                  {!msg.isRead && (
                    <TouchableOpacity
                      style={styles.markReadBtn}
                      onPress={() => handleMarkRead(msg._id)}
                      activeOpacity={0.8}
                    >
                      <CheckCircle color={theme.colors.success} size={16} />
                      <Text style={styles.markReadText}>Mark as Read</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Modal (Simulated for brevity) */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refine Assessment</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalClose}>
                <X color={theme.colors.textPrimary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputBox}>
                <Text style={styles.label}>Test Title</Text>
                <TextInput style={styles.input} value={modalTestTitle} onChangeText={setModalTestTitle} />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.label}>Duration</Text>
                <TextInput style={styles.input} value={modalDuration} onChangeText={setModalDuration} keyboardType="numeric" />
              </View>

              {/* ... Question editing logic ... */}
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleUpdateMockTest}>
                <Text style={styles.saveModalBtnText}>Update Mock Test</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 10,
  },
  tabScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  activeTabText: {
    color: theme.colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 24,
  },
  inputBox: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  diffBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  diffBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  diffBtnTextActive: {
    color: theme.colors.white,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    marginTop: 10,
    ...theme.shadows.md,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  qBuilderBox: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 10,
    marginBottom: 24,
  },
  qBuilderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    marginBottom: 16,
  },
  optionsList: {
    marginTop: 16,
    gap: 12,
  },
  optEntry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
  },
  radioActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    borderWidth: 6,
  },
  optInput: {
    flex: 1,
    padding: 10,
    height: 44,
  },
  addToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primaryLight,
  },
  addToListText: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
    marginLeft: 8,
  },
  currentQs: {
    marginBottom: 30,
  },
  qListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qListText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginRight: 10,
  },
  existingTests: {
    marginTop: 40,
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  testCardInfo: {
    flex: 1,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  testCardMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  testCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  testActionBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
  },
  saveModalBtn: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveModalBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  emptySupport: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptySupportText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  supportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: 16,
    marginBottom: 14,
  },
  supportCardRead: {
    borderColor: theme.colors.border,
    opacity: 0.7,
  },
  supportCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  supportUserInfo: {
    flex: 1,
  },
  supportUserName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  supportUserEmail: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  supportCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  supportTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  supportMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
    fontWeight: '500',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.success,
  },
});

export default AdminScreen;

