import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from '../firebase/initFirebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [clinic, setClinic] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'meta', 'profile');
    getDoc(ref).then(d => {
      if (d.exists()) {
        const data = d.data();
        setName(data.name || '');
        setClinic(data.clinic || '');
        setSpecialty(data.specialty || '');
        setContact(data.contact || '');
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: 'error', text1: 'Требуется вход', text2: 'Войдите для сохранения профиля' });
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid, 'meta', 'profile'), {
        name,
        clinic: clinic || null,
        specialty: specialty || null,
        contact: contact || null,
        updatedAt: serverTimestamp()
      });
      Toast.show({ type: 'success', text1: 'Сохранено', text2: 'Профиль сохранён' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: e.message || String(e) });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      <Text style={styles.label}>Имя врача</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Клиника / Отделение</Text>
      <TextInput style={styles.input} value={clinic} onChangeText={setClinic} />
      <Text style={styles.label}>Специальность</Text>
      <TextInput style={styles.input} value={specialty} onChangeText={setSpecialty} />
      <Text style={styles.label}>Контакт (телефон / email)</Text>
      <TextInput style={styles.input} value={contact} onChangeText={setContact} />
      <View style={{marginTop:12}}>
        <Pressable style={styles.primaryButton} onPress={save}><Text style={styles.primaryButtonText}>Сохранить</Text></Pressable>
      </View>
      <View style={{marginTop:12}}>
        <Pressable style={styles.signOutButton} onPress={async () => { try { await auth.signOut(); Toast.show({ type: 'success', text1: 'Выход' }); } catch (e) { Toast.show({ type: 'error', text1: 'Ошибка', text2: e.message || String(e) }); } }}>
          <Text style={styles.signOutText}>Выйти</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', padding: 12, borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 10 },
  primaryButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  signOutButton: { marginTop: 10, backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center' },
  signOutText: { color: '#fff', fontWeight: '600' }
});
