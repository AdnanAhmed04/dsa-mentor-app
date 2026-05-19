import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, StatusBar, Modal, Alert, TextInput } from 'react-native';
import { User, LogOut, Globe, Settings, ChevronRight, Award, Bell, HelpCircle, Target, X, Check, Mail, Star, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import theme from '../utils/theme';
import { API_URL } from '../utils/constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

const REMINDER_KEY = 'dailyReminderEnabled';
const LANGUAGES = ['Python', 'C++', 'Java'];

const REMINDER_HOUR = 9;
const REMINDER_MINUTE = 0;

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout, updateLanguage, token } = useAuthStore();
  const scrollRef = useRef(null);

  const [dailyReminder, setDailyReminder] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSending, setHelpSending] = useState(false);
  const [helpSent, setHelpSent] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [savingLang, setSavingLang] = useState(false);

  // Feedback state
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      if (navigation.isFocused()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Load saved reminder setting on mount
  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then(val => {
      setDailyReminder(val === 'true');
    });
  }, []);

  const scheduleDailyReminder = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings to use daily reminders.');
      return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'DSA Practice Time! 🧠',
        body: "Don't break your streak! Complete today's DSA topic.",
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'default' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
      },
    });
    return true;
  };

  const cancelDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const handleReminderToggle = async (value) => {
    if (value) {
      const success = await scheduleDailyReminder();
      if (!success) return;
      setDailyReminder(true);
      await AsyncStorage.setItem(REMINDER_KEY, 'true');
      Alert.alert('Reminder Set!', `You'll get a daily reminder at ${REMINDER_HOUR}:${String(REMINDER_MINUTE).padStart(2, '0')} AM.`);
    } else {
      await cancelDailyReminder();
      setDailyReminder(false);
      await AsyncStorage.setItem(REMINDER_KEY, 'false');
    }
  };

  const handleSelectLanguage = async (lang) => {
    if (lang === user?.selectedLanguage) {
      setLangModalOpen(false);
      return;
    }
    setSavingLang(true);
    try {
      await updateLanguage(lang);
      setLangModalOpen(false);
    } catch (err) {
      Alert.alert('Error', 'Could not update language. Please try again.');
    } finally {
      setSavingLang(false);
    }
  };

  const openHelpModal = () => {
    setHelpMessage('');
    setHelpSent(false);
    setHelpModalOpen(true);
  };

  const handleSendHelpMessage = async () => {
    if (!helpMessage.trim()) {
      Alert.alert('Empty Message', 'Please write your message before sending.');
      return;
    }
    setHelpSending(true);
    try {
      await axios.post(`${API_URL}/support`, { message: helpMessage.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHelpSent(true);
    } catch {
      Alert.alert('Error', 'Could not send message. Please try again.');
    } finally {
      setHelpSending(false);
    }
  };

  const openFeedbackModal = useCallback(async () => {
    setFeedbackLoading(true);
    setOverwriteConfirmed(false);
    try {
      const res = await axios.get(`${API_URL}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existing = res.data.data.feedback;
      setExistingFeedback(existing);
      if (existing) {
        // Pre-fill with existing values, user will confirm overwrite
        setFeedbackRating(existing.rating);
        setFeedbackMessage(existing.message || '');
      } else {
        setFeedbackRating(0);
        setFeedbackMessage('');
      }
    } catch {
      setExistingFeedback(null);
      setFeedbackRating(0);
      setFeedbackMessage('');
    } finally {
      setFeedbackLoading(false);
      setFeedbackModalOpen(true);
    }
  }, [token]);

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    setFeedbackLoading(true);
    try {
      await axios.post(`${API_URL}/feedback`, {
        rating: feedbackRating,
        message: feedbackMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackModalOpen(false);
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
    } catch (err) {
      Alert.alert('Error', 'Could not submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const ProfileItem = ({ icon: Icon, label, value, onPress, color = theme.colors.textSecondary, isLast = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, isLast && styles.noBorder]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
          <Icon color={color} size={20} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        {onPress ? <ChevronRight color={theme.colors.textMuted} size={18} /> : null}
      </View>
    </TouchableOpacity>
  );

  // Determines if user can edit feedback (no existing, or overwrite confirmed)
  const canEditFeedback = !existingFeedback || overwriteConfirmed;

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[theme.colors.primaryDark, theme.colors.background]}
          style={[styles.headerGradient, { paddingTop: insets.top + 40 }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <User color={theme.colors.primaryLight} size={48} />
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Settings color={theme.colors.white} size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.name || 'Developer'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Award color={theme.colors.warning} size={20} />
                <View style={styles.statTextGroup}>
                  <Text style={styles.statVal}>{user?.points || 0}</Text>
                  <Text style={styles.statLab}>Points</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Target color={theme.colors.primaryLight} size={20} />
                <View style={styles.statTextGroup}>
                  <Text style={styles.statVal}>85%</Text>
                  <Text style={styles.statLab}>Rank</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Preferences</Text>
            <View style={styles.card}>
              <ProfileItem
                icon={Globe}
                label="Primary Language"
                value={user?.selectedLanguage}
                color={theme.colors.primaryLight}
                onPress={() => setLangModalOpen(true)}
              />
              <View style={[styles.settingItem, styles.noBorder]}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconWrapper, { backgroundColor: theme.colors.success + '15' }]}>
                    <Bell color={theme.colors.success} size={20} />
                  </View>
                  <Text style={styles.settingLabel}>Daily Reminder</Text>
                </View>
                <Switch
                  value={dailyReminder}
                  onValueChange={handleReminderToggle}
                  trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : theme.colors.white}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.card}>
              <ProfileItem
                icon={MessageSquare}
                label="Give Feedback"
                color={theme.colors.primaryLight}
                onPress={openFeedbackModal}
              />
              <ProfileItem
                icon={HelpCircle}
                label="Help & Support"
                onPress={openHelpModal}
                isLast={true}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <LogOut color={theme.colors.error} size={20} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>DSA Mastery v1.2.0 • Build 2024</Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={langModalOpen} transparent animationType="fade" onRequestClose={() => setLangModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !savingLang && setLangModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Primary Language</Text>
              <TouchableOpacity onPress={() => !savingLang && setLangModalOpen(false)} style={styles.modalClose}>
                <X color={theme.colors.textPrimary} size={22} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Pick the language you want to practice with</Text>
            {LANGUAGES.map((lang) => {
              const isActive = user?.selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langRow, isActive && styles.langRowActive]}
                  onPress={() => handleSelectLanguage(lang)}
                  disabled={savingLang}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langRowText, isActive && styles.langRowTextActive]}>{lang}</Text>
                  {isActive && <Check color={theme.colors.primaryLight} size={20} />}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Help Modal */}
      <Modal visible={helpModalOpen} transparent animationType="fade" onRequestClose={() => !helpSending && setHelpModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !helpSending && setHelpModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => !helpSending && setHelpModalOpen(false)} style={styles.modalClose}>
                <X color={theme.colors.textPrimary} size={22} />
              </TouchableOpacity>
            </View>

            {helpSent ? (
              <>
                <View style={styles.helpIconWrap}>
                  <Check color={theme.colors.success} size={36} />
                </View>
                <Text style={styles.helpHeadline}>Message Sent!</Text>
                <Text style={styles.helpBody}>
                  Our admin team will review your message and contact you at {user?.email}.
                </Text>
                <TouchableOpacity style={styles.helpBtn} onPress={() => setHelpModalOpen(false)} activeOpacity={0.85}>
                  <Text style={styles.helpBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.helpIconWrap}>
                  <Mail color={theme.colors.primaryLight} size={36} />
                </View>
                <Text style={styles.helpHeadline}>How can we help?</Text>
                <Text style={styles.helpBody}>
                  Describe your issue and our admin team will reach out to you via email.
                </Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Describe your issue or question..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  value={helpMessage}
                  onChangeText={setHelpMessage}
                  editable={!helpSending}
                />
                <TouchableOpacity
                  style={[styles.helpBtn, helpSending && { opacity: 0.6 }]}
                  onPress={handleSendHelpMessage}
                  activeOpacity={0.85}
                  disabled={helpSending}
                >
                  <Text style={styles.helpBtnText}>{helpSending ? 'Sending...' : 'Send Message'}</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={feedbackModalOpen} transparent animationType="fade" onRequestClose={() => setFeedbackModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !feedbackLoading && setFeedbackModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>App Feedback</Text>
              <TouchableOpacity onPress={() => !feedbackLoading && setFeedbackModalOpen(false)} style={styles.modalClose}>
                <X color={theme.colors.textPrimary} size={22} />
              </TouchableOpacity>
            </View>

            {/* Existing feedback banner */}
            {existingFeedback && !overwriteConfirmed && (
              <View style={styles.existingBanner}>
                <Text style={styles.existingTitle}>Your Previous Feedback</Text>
                <View style={styles.existingStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={18}
                      color={i <= existingFeedback.rating ? '#f59e0b' : theme.colors.border}
                      fill={i <= existingFeedback.rating ? '#f59e0b' : 'transparent'}
                    />
                  ))}
                </View>
                {existingFeedback.message ? (
                  <Text style={styles.existingMessage}>"{existingFeedback.message}"</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.overwriteBtn}
                  onPress={() => setOverwriteConfirmed(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.overwriteBtnText}>Update My Feedback</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Feedback form — shown when no existing, or overwrite confirmed */}
            {canEditFeedback && (
              <>
                <Text style={styles.modalSubtitle}>How would you rate this app?</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity key={i} onPress={() => setFeedbackRating(i)} activeOpacity={0.7}>
                      <Star
                        size={36}
                        color={i <= feedbackRating ? '#f59e0b' : theme.colors.border}
                        fill={i <= feedbackRating ? '#f59e0b' : 'transparent'}
                        style={{ marginHorizontal: 4 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Share your thoughts (optional)..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={feedbackMessage}
                  onChangeText={setFeedbackMessage}
                  editable={!feedbackLoading}
                />

                <TouchableOpacity
                  style={[styles.helpBtn, feedbackLoading && { opacity: 0.6 }]}
                  onPress={handleSubmitFeedback}
                  activeOpacity={0.85}
                  disabled={feedbackLoading}
                >
                  <Text style={styles.helpBtnText}>{feedbackLoading ? 'Submitting...' : 'Submit Feedback'}</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginTop: 30,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    ...theme.shadows.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
  },
  statTextGroup: {
    marginLeft: 12,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  statLab: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 14,
    fontWeight: '600',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginRight: 10,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 18,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.error,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 30,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 18,
    marginTop: 4,
    fontWeight: '500',
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    backgroundColor: theme.colors.background,
  },
  langRowActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  langRowText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  langRowTextActive: {
    color: theme.colors.textPrimary,
  },
  helpIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  helpHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  helpBody: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  helpBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  helpBtnText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  // Feedback styles
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  feedbackInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
    color: theme.colors.textPrimary,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontWeight: '500',
  },
  existingBanner: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 16,
  },
  existingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  existingStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  existingMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 14,
  },
  overwriteBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  overwriteBtnText: {
    color: theme.colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;
