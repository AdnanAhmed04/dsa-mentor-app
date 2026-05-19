import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, StatusBar } from 'react-native';
import { X, ChevronRight, Trophy, Clock, Target, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import theme from '../utils/theme';

const MockTestScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
// ... existing state and logic ...
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    try {
      const response = await axios.get('/submissions/mock-test', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTest(response.data.data.mockTest);
    } catch (err) {
      console.error('Failed to fetch mock test', err);
      Alert.alert('No Mock Tests', 'Could not find any mock tests. Please check back later.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const newAnswers = [...answers, { questionIndex: currentQuestionIndex, selectedOption }];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/submissions/mock-test', {
        testId: test._id,
        answers: finalAnswers,
        timeTaken: 600
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data.data.submission);
      setIsFinished(true);
    } catch (err) {
      console.error('Submission failed', err);
      Alert.alert('Error', 'Failed to submit test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{isSubmitting ? 'Analyzing Performance...' : 'Preparing Assessment...'}</Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.resultContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={[styles.resultHeader, { paddingTop: insets.top + 20 }]}>
          <View style={styles.trophyWrapper}>
            <Trophy color={theme.colors.warning} size={64} />
          </View>
          <Text style={styles.resultTitle}>Mock Test Results</Text>
          <View style={styles.scoreHighlight}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.scoreVal}>{result.score} / {result.totalMarks}</Text>
          </View>
        </View>
        
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Performance Breakdown</Text>
          {result.topicBreakdown.map((item, i) => (
            <View key={i} style={styles.breakdownItem}>
              <View style={styles.breakdownInfo}>
                <Target color={theme.colors.textMuted} size={16} />
                <Text style={styles.breakdownName} numberOfLines={1}>Topic {i + 1}</Text>
              </View>
              <View style={styles.breakdownProgress}>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniBar, { width: `${(item.correct / item.total) * 100}%` }]} />
                </View>
                <Text style={styles.breakdownScore}>{item.correct}/{item.total}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
          activeOpacity={0.8}
          style={[styles.doneBtnWrapper, { marginBottom: insets.bottom + 20 }]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>Complete Review</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.timerBadge}>
          <Clock color={theme.colors.primaryLight} size={16} />
          <Text style={styles.timerText}>45:00</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }]} />
          </View>
          <Text style={styles.qCountText}>{currentQuestionIndex + 1}/{test.questions.length}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X color={theme.colors.textPrimary} size={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.quizContent}>
        <View style={styles.typeTag}>
          <AlertCircle color={theme.colors.primary} size={14} />
          <Text style={styles.typeText}>{currentQuestion.type}</Text>
        </View>
        
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            activeOpacity={0.7}
            style={[styles.optionCard, selectedOption === index && styles.selectedOption]}
            onPress={() => setSelectedOption(index)}
          >
            <View style={[styles.optionMarker, selectedOption === index && styles.markerActive]}>
              <Text style={[styles.markerText, selectedOption === index && styles.markerTextActive]}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.optionText, selectedOption === index && styles.selectedOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          disabled={selectedOption === null}
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <LinearGradient
            colors={selectedOption === null ? [theme.colors.surfaceLight, theme.colors.surface] : [theme.colors.primary, theme.colors.primaryDark]}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {currentQuestionIndex === test.questions.length - 1 ? 'Finalize Test' : 'Next Question'}
            </Text>
            <ChevronRight color={theme.colors.white} size={20} />
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
  loadingText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  timerText: {
    marginLeft: 6,
    fontWeight: '700',
    color: theme.colors.primaryLight,
    fontSize: 13,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  qCountText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quizContent: {
    padding: theme.spacing.lg,
    flex: 1,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeText: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 32,
    lineHeight: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderWidth: 2,
  },
  optionMarker: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  markerActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  markerText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textMuted,
  },
  markerTextActive: {
    color: theme.colors.white,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  selectedOptionText: {
    color: theme.colors.textPrimary,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    ...theme.shadows.md,
  },
  nextBtnText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  resultContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  trophyWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 24,
  },
  scoreHighlight: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreVal: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    marginTop: 4,
  },
  statsBox: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  breakdownInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.4,
  },
  breakdownName: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  breakdownProgress: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 2,
    marginRight: 10,
  },
  miniBar: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 2,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    width: 40,
    textAlign: 'right',
  },
  doneBtnWrapper: {
    width: '100%',
  },
  doneBtn: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  doneBtnText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  }
});

export default MockTestScreen;

