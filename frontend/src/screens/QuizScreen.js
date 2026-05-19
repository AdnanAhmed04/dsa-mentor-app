import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, StatusBar } from 'react-native';
import { X, ChevronRight, CheckCircle2, Trophy, Clock, Target, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import theme from '../utils/theme';

const QuizScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { topicId } = route.params;
// ... existing state and logic ...
  const { token } = useAuthStore();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/topics/${topicId}/quiz`);
      setQuiz(response.data.data.quiz);
    } catch (err) {
      console.error('Failed to fetch quiz', err);
      Alert.alert('Error', 'No quiz found for this topic.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const newAnswers = [...answers, { 
      questionIndex: currentQuestionIndex, 
      selectedOption 
    }];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/submissions/quiz', {
        testId: quiz._id,
        answers: finalAnswers,
        timeTaken: 120 // Placeholder
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data.data.submission);
      setIsFinished(true);
    } catch (err) {
      console.error('Submission failed', err);
      Alert.alert('Error', 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {isSubmitting && <Text style={styles.loadingText}>Analyzing performance...</Text>}
      </View>
    );
  }

  if (isFinished) {
    const percentage = Math.round((result.score / result.totalMarks) * 100);
    const hasPassed = result.passed;

    return (
      <View style={styles.resultContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={[styles.resultHeader, { paddingTop: insets.top + 20 }]}>
          <View style={[styles.trophyContainer, { backgroundColor: hasPassed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)' }]}>
            <Trophy color={hasPassed ? theme.colors.warning : theme.colors.textMuted} size={60} />
          </View>
          <Text style={styles.resultTitle}>{hasPassed ? "Quiz Mastered!" : "Almost There!"}</Text>
          <Text style={styles.resultSubtitle}>
            {hasPassed 
              ? "Exceptional work! You've successfully completed this module." 
              : "Review the materials and try again. Practice makes perfect!"}
          </Text>
        </View>

        <View style={styles.scoreBoard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreVal}>{result.score}</Text>
            <Text style={styles.scoreMax}>out of {result.totalMarks}</Text>
          </View>
          <View style={styles.accuracyMeter}>
            <Text style={styles.accuracyLabel}>Accuracy</Text>
            <Text style={[styles.accuracyVal, { color: hasPassed ? theme.colors.success : theme.colors.error }]}>{percentage}%</Text>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <CheckCircle2 color={theme.colors.success} size={20} />
            <Text style={styles.statText}>{result.answers.filter(a => a.isCorrect).length} Correct</Text>
          </View>
          <View style={styles.statItem}>
            <AlertTriangle color={theme.colors.error} size={20} />
            <Text style={styles.statText}>{result.answers.filter(a => !a.isCorrect).length} Incorrect</Text>
          </View>
        </View>

        <View style={[styles.resultActions, { paddingBottom: insets.bottom + 20 }]}>
          {!hasPassed && (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                setIsFinished(false);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setAnswers([]);
                setResult(null);
              }}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Retake Quiz</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.secondaryBtn]}
            onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
          >
            <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X color={theme.colors.textPrimary} size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{currentQuestionIndex + 1} of {quiz.questions.length}</Text>
        </View>
      </View>

      <View style={styles.quizContent}>
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity 
            key={index}
            activeOpacity={0.7}
            style={[
              styles.optionCard,
              selectedOption === index && styles.selectedOption
            ]}
            onPress={() => setSelectedOption(index)}
          >
            <View style={[styles.optionIndex, selectedOption === index && styles.optionIndexActive]}>
              <Text style={[styles.optionIndexText, selectedOption === index && styles.optionIndexTextActive]}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.optionText, selectedOption === index && styles.selectedOptionText]}>
              {option}
            </Text>
            {selectedOption === index && <CheckCircle2 color={theme.colors.primaryLight} size={20} />}
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
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
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
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressTrack: {
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
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  quizContent: {
    padding: theme.spacing.lg,
    flex: 1,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 40,
    lineHeight: 32,
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
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionIndexActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionIndexText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  optionIndexTextActive: {
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
  trophyContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  resultSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreBoard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreCircle: {
    alignItems: 'flex-start',
  },
  scoreVal: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  scoreMax: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  accuracyMeter: {
    alignItems: 'flex-end',
  },
  accuracyLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  accuracyVal: {
    fontSize: 28,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  resultActions: {
    gap: 16,
  },
  primaryBtn: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryBtn: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default QuizScreen;

