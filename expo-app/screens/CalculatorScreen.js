import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from '../firebase/initFirebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function round(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Cockcroft-Gault calculation
function cockcroftGault(weightKg, ageYears, serumCrMgDl, isFemale) {
  const sexFactor = isFemale ? 0.85 : 1.0;
  const cr = ((140 - ageYears) * weightKg) / (72 * serumCrMgDl);
  return cr * sexFactor;
}

export default function CalculatorScreen({ navigation }) {
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('40');
  const [creatinine, setCreatinine] = useState('1.0');
  const [patientName, setPatientName] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' or 'lb'
  const [creatinineUnit, setCreatinineUnit] = useState('mg/dL'); // 'mg/dL' or 'umol/L'
  const [female, setFemale] = useState(false);
  const [result, setResult] = useState(null);

  const calculate = async () => {
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const cr = parseFloat(creatinine);
    if (isNaN(w) || isNaN(a) || isNaN(cr) || cr <= 0) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: 'Проверьте введённые значения' });
      return;
    }
    // convert weight to kg if needed
    const weightKg = weightUnit === 'lb' ? w * 0.45359237 : w;
    // convert creatinine to mg/dL if needed (µmol/L -> mg/dL: divide by 88.4)
    const creatMgDl = creatinineUnit === 'umol/L' ? (cr / 88.4) : cr;

    const cg = cockcroftGault(weightKg, a, creatMgDl, female);
    const rounded = round(cg, 2);
    setResult(rounded);

    // Auto-save to Firestore if user is authenticated. Do NOT save locally.
    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: 'info', text1: 'Результат рассчитан', text2: 'Войдите, чтобы сохранить в историю' });
      return;
    }
    try {
      await addDoc(collection(db, 'users', user.uid, 'history'), {
        patientName: patientName || null,
        weightRaw: parseFloat(weight),
        weightUnit,
        weightKg: parseFloat(weightKg),
        age: parseFloat(age),
        creatinineRaw: parseFloat(creatinine),
        creatinineUnit,
        creatinineMgDl: parseFloat(creatMgDl),
        female,
        result: rounded,
        createdAt: serverTimestamp()
      });
      Toast.show({ type: 'success', text1: 'Сохранено в облаке' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Ошибка сохранения', text2: e.message || String(e) });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cockcroft–Gault</Text>
      <Text style={styles.subtitle}>Оценка функции почек (мл/мин)</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Имя пациента (опционально)</Text>
        <TextInput style={styles.input} value={patientName} onChangeText={setPatientName} placeholder="Фамилия Имя" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Вес</Text>
        <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
          <TextInput style={[styles.input, {flex:1}]} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder={weightUnit} />
          <View style={{flexDirection:'row', borderRadius:8, overflow:'hidden', borderWidth:1, borderColor:'#eee'}}>
            <Pressable onPress={() => setWeightUnit('kg')} style={[styles.toggleBtn, weightUnit==='kg' && styles.toggleActive]}><Text style={[styles.toggleText, weightUnit==='kg' && styles.toggleTextActive]}>kg</Text></Pressable>
            <Pressable onPress={() => setWeightUnit('lb')} style={[styles.toggleBtn, weightUnit==='lb' && styles.toggleActive]}><Text style={[styles.toggleText, weightUnit==='lb' && styles.toggleTextActive]}>lb</Text></Pressable>
          </View>
        </View>
      </View>

      <View style={styles.rowDouble}>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Возраст</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="лет" />
        </View>
        <View style={styles.formHalf}>
          <Text style={styles.label}>Креатинин</Text>
          <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
            <TextInput style={[styles.input, {flex:1}]} value={creatinine} onChangeText={setCreatinine} keyboardType="numeric" placeholder={creatinineUnit} />
            <View style={{flexDirection:'row', borderRadius:8, overflow:'hidden', borderWidth:1, borderColor:'#eee'}}>
              <Pressable onPress={() => setCreatinineUnit('mg/dL')} style={[styles.toggleBtn, creatinineUnit==='mg/dL' && styles.toggleActive]}><Text style={[styles.toggleText, creatinineUnit==='mg/dL' && styles.toggleTextActive]}>mg/dL</Text></Pressable>
              <Pressable onPress={() => setCreatinineUnit('umol/L')} style={[styles.toggleBtn, creatinineUnit==='umol/L' && styles.toggleActive]}><Text style={[styles.toggleText, creatinineUnit==='umol/L' && styles.toggleTextActive]}>µmol/L</Text></Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.rowToggle}>
        <Text style={styles.label}>Пол</Text>
        <View style={styles.toggleWrap}>
          <Pressable onPress={() => setFemale(false)} style={[styles.toggleBtn, !female && styles.toggleActive]}>
            <Text style={[styles.toggleText, !female && styles.toggleTextActive]}>Муж</Text>
          </Pressable>
          <Pressable onPress={() => setFemale(true)} style={[styles.toggleBtn, female && styles.toggleActive]}>
            <Text style={[styles.toggleText, female && styles.toggleTextActive]}>Жен</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.rowButton}>
        <Pressable style={styles.primaryButton} onPress={calculate}>
          <Text style={styles.primaryButtonText}>Рассчитать</Text>
        </Pressable>
      </View>

      {result !== null && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Креатининовый клиренс</Text>
          <Text style={styles.resultValue}>{result} mL/min</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', padding: 12, borderRadius: 8, backgroundColor: '#fafafa' },
  rowDouble: { flexDirection: 'row', marginBottom: 12 },
  formHalf: { flex: 1, marginRight: 8 },
  rowToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  toggleWrap: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff' },
  toggleActive: { backgroundColor: '#2563eb' },
  toggleText: { color: '#333' },
  toggleTextActive: { color: '#fff' },
  rowButton: { marginVertical: 14 },
  primaryButton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  resultCard: { marginTop: 16, padding: 14, borderRadius: 10, backgroundColor: '#f3f4f6' },
  resultLabel: { color: '#666' },
  resultValue: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  saveButton: { marginTop: 12, backgroundColor: '#0ea5a4', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' }
});
