import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { auth } from '../firebase/initFirebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: 'Заполните все поля' });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({ type: 'success', text1: 'Добро пожаловать!' });
    } catch (e: any) {
      const errorMsg = e.code === 'auth/user-not-found' ? 'Пользователь не найден' :
                       e.code === 'auth/wrong-password' ? 'Неверный пароль' :
                       e.code === 'auth/invalid-email' ? 'Некорректный email' :
                       'Ошибка входа';
      Toast.show({ type: 'error', text1: errorMsg, text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: 'Заполните все поля' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: 'Пароль должен быть минимум 6 символов' });
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Toast.show({ type: 'success', text1: 'Аккаунт создан!' });
    } catch (e: any) {
      const errorMsg = e.code === 'auth/email-already-in-use' ? 'Email уже используется' :
                       e.code === 'auth/invalid-email' ? 'Некорректный email' :
                       e.code === 'auth/weak-password' ? 'Слабый пароль' :
                       'Ошибка регистрации';
      Toast.show({ type: 'error', text1: errorMsg, text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Декоративный фон */}
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="water" size={48} color="#007AFF" />
          </View>
          <Text style={styles.appTitle}>Клиренс Pro</Text>
          <Text style={styles.appSubtitle}>Калькулятор функции почек</Text>
        </LinearGradient>

        {/* Форма */}
        <View style={styles.formCard}>
          {/* Переключатель режима */}
          <View style={styles.tabsContainer}>
            <Pressable 
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Вход</Text>
            </Pressable>
            <Pressable 
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Регистрация</Text>
            </Pressable>
          </View>

          {/* Поля ввода */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" />
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                placeholder="your@email.com"
                placeholderTextColor="#CBD5E1"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                secureTextEntry={!showPassword}
                value={password} 
                onChangeText={setPassword} 
                placeholder="Минимум 6 символов"
                placeholderTextColor="#CBD5E1"
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#94A3B8" 
                />
              </Pressable>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.passwordHint}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.passwordHintText}>
                Пароль должен содержать минимум 6 символов
              </Text>
            </View>
          )}

          {/* Кнопка действия */}
          <Pressable 
            onPress={isLogin ? signIn : register}
            disabled={loading}
            style={({ pressed }) => [
              styles.submitBtnWrapper,
              pressed && styles.submitBtnPressed
            ]}
          >
            <LinearGradient
              colors={loading ? ['#94A3B8', '#64748B'] : ['#007AFF', '#0051D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              {loading ? (
                <Text style={styles.submitBtnText}>Загрузка...</Text>
              ) : (
                <>
                  <Ionicons 
                    name={isLogin ? "log-in-outline" : "person-add-outline"} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.submitBtnText}>
                    {isLogin ? 'Войти' : 'Создать аккаунт'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Разделитель */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Переключение между входом и регистрацией */}
          <Pressable 
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <Text style={styles.switchTextBold}>
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </Text>
            </Text>
          </Pressable>
        </View>

        {/* Футер */}
        <View style={styles.footer}>
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              </View>
              <Text style={styles.featureText}>Безопасно</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name="cloud" size={20} color="#007AFF" />
              </View>
              <Text style={styles.featureText}>Облачное хранение</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.featureText}>Аналитика</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40
  },

  // Шапка с градиентом
  headerGradient: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -1
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  },

  // Карточка формы
  formCard: {
    margin: 20,
    marginTop: -30,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8
  },

  // Вкладки
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B'
  },
  tabTextActive: {
    color: '#007AFF'
  },

  // Поля ввода
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
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
    paddingHorizontal: 14,
    gap: 10
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A'
  },
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginBottom: 16
  },
  passwordHintText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1
  },

  // Кнопка отправки
  submitBtnWrapper: {
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },

  // Разделитель
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  dividerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500'
  },

  // Переключатель режима
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12
  },
  switchText: {
    fontSize: 15,
    color: '#64748B'
  },
  switchTextBold: {
    fontWeight: '700',
    color: '#007AFF'
  },

  // Футер с преимуществами
  footer: {
    paddingHorizontal: 20,
    marginTop: 20
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  featureIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  featureText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center'
  }
});