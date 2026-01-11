import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from '../firebase/initFirebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const submit = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        Toast.show({ type: 'success', text1: 'Готово', text2: 'Аккаунт создан' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: e.message || String(e) });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? 'Регистрация' : 'Вход'}</Text>
      <Text>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Пароль</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <View style={{marginTop:12}}>
        <Button title={isRegister ? 'Зарегистрироваться' : 'Войти'} onPress={submit} />
      </View>
      <View style={{marginTop:10}}>
        <Button title={isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'} onPress={() => setIsRegister(!isRegister)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 10 }
});
