import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Switch, Alert } from 'react-native';
import { auth, db } from '../firebase/initFirebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileData {
  name?: string;
  institution?: string;
  position?: string;
  contact?: string;
}

function initials(name?: string) {
  if (!name) return '';
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
}

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState<ProfileData>({});
  const [editing, setEditing] = useState(false);
  const { theme, mode, toggle } = useTheme();

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'meta', 'profile');
    getDoc(ref).then(d => {
      if (d.exists()) setProfile(d.data() as ProfileData);
    }).catch(() => {});
  }, [user]);

  const save = async () => {
    if (!user) { Toast.show({ type: 'error', text1: 'Требуется вход' }); return; }
    try {
      await setDoc(doc(db, 'users', user.uid, 'meta', 'profile'), { ...profile, updatedAt: serverTimestamp() });
      Toast.show({ type: 'success', text1: 'Профиль сохранён' });
      setEditing(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: e.message || String(e) });
    }
  };

  const doSignOut = async () => {
    try {
      await signOut(auth);
      Toast.show({ type: 'success', text1: 'Вы вышли из аккаунта' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: String(e) });
    }
  };

  const onNotifications = () => {
    Alert.alert('Уведомления', 'Функция уведомлений в разработке');
    Toast.show({ type: 'info', text1: 'Уведомления', text2: 'В разработке' });
  };

  const onPrivacy = () => {
    Alert.alert('Конфиденциальность', 'Настройки конфиденциальности в разработке');
    Toast.show({ type: 'info', text1: 'Конфиденциальность', text2: 'В разработке' });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Шапка с градиентом */}
      <LinearGradient
        colors={[theme.accent ?? '#8B5CF6', theme.primary ?? '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials(profile.name || user?.email || '')}
            </Text>
          </View>
          {editing && (
            <Pressable style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color="#fff" />
            </Pressable>
          )}
        </View>
        <Text style={styles.userName}>
          {profile.name || user?.displayName || 'Врач'}
        </Text>
        <Text style={styles.userPosition}>
          {profile.position || 'Должность не указана'}
        </Text>
        {profile.institution && (
          <View style={styles.institutionTag}>
            <Ionicons name="business-outline" size={14} color="#fff" />
            <Text style={styles.institutionText}>{profile.institution}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Основная карточка */}
      <View style={[styles.mainCard, { backgroundColor: theme.card }]}> 
        {editing ? (
          // Режим редактирования
          <View>
            <Text style={styles.sectionTitle}>Редактирование профиля</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Полное имя</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <Ionicons name="person-outline" size={18} color={theme.mutted} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Иванов Иван Иванович" 
                    value={profile.name || ''} 
                    onChangeText={v => setProfile(p => ({...p, name: v}))}
                    placeholderTextColor={theme.mutted}
                  />
                </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Учреждение</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <Ionicons name="business-outline" size={18} color={theme.mutted} />
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="Городская больница №1" 
                  value={profile.institution || ''} 
                  onChangeText={v => setProfile(p => ({...p, institution: v}))}
                  placeholderTextColor={theme.mutted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Должность</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <Ionicons name="briefcase-outline" size={18} color={theme.mutted} />
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="Врач-нефролог" 
                  value={profile.position || ''} 
                  onChangeText={v => setProfile(p => ({...p, position: v}))}
                  placeholderTextColor={theme.mutted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Телефон</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <Ionicons name="call-outline" size={18} color={theme.mutted} />
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="+7 (999) 123-45-67" 
                  value={profile.contact || ''} 
                  onChangeText={v => setProfile(p => ({...p, contact: v}))}
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.mutted}
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.saveButton, { backgroundColor: theme.success }]} onPress={save}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Сохранить</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.cancelButton, { backgroundColor: theme.card }]} onPress={() => setEditing(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.mutted }]}>Отмена</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // Режим просмотра
          <View>
            <View style={styles.infoSection}>
              <View style={[styles.infoRow, { backgroundColor: theme.background }] }>
                <View style={[styles.iconCircle, { backgroundColor: theme.card }] }>
                  <Ionicons name="mail-outline" size={20} color={theme.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.mutted }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{user?.email ?? '—'}</Text>
                </View>
              </View>

              {profile.contact && (
                <View style={[styles.infoRow, { backgroundColor: theme.background }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
                    <Ionicons name="call-outline" size={20} color={theme.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.mutted }]}>Телефон</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{profile.contact}</Text>
                  </View>
                </View>
              )}

              {profile.institution && (
                <View style={[styles.infoRow, { backgroundColor: theme.background }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
                    <Ionicons name="business-outline" size={20} color={theme.warning} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.mutted }]}>Учреждение</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{profile.institution}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <Pressable style={[styles.editButton, { backgroundColor: theme.card, borderColor: (theme.accent ?? '#8B5CF6') + '22' }]} onPress={() => setEditing(true)}>
                <Ionicons name="create-outline" size={20} color={theme.accent} />
                <Text style={[styles.editButtonText, { color: theme.accent }]}>Редактировать</Text>
              </Pressable>

              <Pressable style={[styles.signOutButton, { backgroundColor: theme.card, borderColor: (theme.danger ?? '#EF4444') + '22' }]} onPress={doSignOut}>
                <Ionicons name="log-out-outline" size={20} color={theme.danger} />
                <Text style={[styles.signOutButtonText, { color: theme.danger }]}>Выйти</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Дополнительные секции */}
      {!editing && (
        <>
          <View style={[styles.card, { backgroundColor: theme.card }] }>
            <Text style={styles.cardTitle}>Настройки</Text>
            <Pressable style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={onNotifications} accessibilityRole="button" accessible={true}>
              <Ionicons name="notifications-outline" size={22} color={theme.mutted} />
              <Text style={[styles.menuText, { color: theme.text }]}>Уведомления</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.mutted} />
            </Pressable>
            <Pressable style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={onPrivacy} accessibilityRole="button" accessible={true}>
              <Ionicons name="shield-checkmark-outline" size={22} color={theme.mutted} />
              <Text style={[styles.menuText, { color: theme.text }]}>Конфиденциальность</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.mutted} />
            </Pressable>
            <Pressable style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={toggle} accessibilityRole="button" accessible={true}>
              <Ionicons name="moon-outline" size={22} color={theme.mutted} />
              <Text style={[styles.menuText, { color: theme.text }]}>Тема — {mode === 'dark' ? 'Тёмная' : 'Светлая'}</Text>
              <Switch value={mode === 'dark'} onValueChange={() => {}} trackColor={{ true: theme.primary }} thumbColor={mode === 'dark' ? '#fff' : '#fff'} pointerEvents="none" />
            </Pressable>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={styles.cardTitle}>О приложении</Text>
            <View style={[styles.aboutRow, { borderBottomColor: theme.border }] }>
              <Text style={[styles.aboutLabel, { color: theme.mutted }]}>Версия</Text>
              <Text style={[styles.aboutValue, { color: theme.text }]}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, { borderBottomColor: theme.border }] }>
              <Text style={[styles.aboutLabel, { color: theme.mutted }]}>Разработчик</Text>
              <Text style={[styles.aboutValue, { color: theme.text }]}>Medical Apps</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    paddingBottom: 100
  },

  // Шапка с градиентом
  header: { 
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatar: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  avatarText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 32
  },
  editAvatarBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  userName: { 
    fontSize: 24, 
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5
  },
  userPosition: { 
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    marginBottom: 8
  },
  institutionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginTop: 4
  },
  institutionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },

  // Основная карточка
  mainCard: {
    margin: 20,
    marginTop: -20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  sectionTitle: { 
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
    color: '#0F172A'
  },

  // Поля ввода
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    gap: 8
  },
  input: { 
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#0F172A'
  },

  // Кнопки в режиме редактирования
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 15
  },

  // Информационные блоки
  infoSection: {
    gap: 12,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 12
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A'
  },

  // Кнопки действий
  actionButtons: {
    gap: 10
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    gap: 8
  },
  editButtonText: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 15
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: 8
  },
  signOutButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15
  },

  // Дополнительные карточки
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500'
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  aboutLabel: {
    fontSize: 14,
    color: '#64748B'
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A'
  }
});