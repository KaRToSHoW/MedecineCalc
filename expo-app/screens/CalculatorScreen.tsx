import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from '../firebase/initFirebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

function round(value: number, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function cockcroftGault(weightKg: number, ageYears: number, serumCrMgDl: number, isFemale: boolean) {
  const sexFactor = isFemale ? 0.85 : 1.0;
  const cr = ((140 - ageYears) * weightKg) / (72 * serumCrMgDl);
  return cr * sexFactor;
}

export default function CalculatorScreen({ navigation }: { navigation?: any }) {
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('40');
  const [creatinine, setCreatinine] = useState('1.0');
  const [patientName, setPatientName] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [creatinineUnit, setCreatinineUnit] = useState<'mg/dL' | 'umol/L'>('mg/dL');
  const [female, setFemale] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const calculate = async () => {
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const cr = parseFloat(creatinine);
    if (isNaN(w) || isNaN(a) || isNaN(cr) || cr <= 0) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: 'Проверьте введённые значения' });
      return;
    }
    const weightKg = weightUnit === 'lb' ? w * 0.45359237 : w;
    const creatMgDl = creatinineUnit === 'umol/L' ? (cr / 88.4) : cr;

    const cg = cockcroftGault(weightKg, a, creatMgDl, female);
    const rounded = round(cg, 2);
    setResult(rounded);

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
        weightKg: parseFloat(String(weightKg)),
        age: parseFloat(age),
        creatinineRaw: parseFloat(creatinine),
        creatinineUnit,
        creatinineMgDl: parseFloat(String(creatMgDl)),
        female,
        result: rounded,
        createdAt: serverTimestamp()
      });
      Toast.show({ type: 'success', text1: 'Сохранено в облаке' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Ошибка сохранения', text2: e.message || String(e) });
    }
  };

  function classifyClCr(val: number | null) {
    if (val === null) return { label: '—', color: '#64748B', bg: '#F1F5F9' };
    if (val >= 90) return { label: 'Норма', color: '#059669', bg: '#ECFDF5' };
    if (val >= 60) return { label: 'Лёгкое снижение', color: '#F59E0B', bg: '#FFFBEB' };
    if (val >= 30) return { label: 'Умеренное снижение', color: '#F97316', bg: '#FFF7ED' };
    if (val >= 15) return { label: 'Выраженное снижение', color: '#DC2626', bg: '#FFF1F2' };
    return { label: 'Терминальная почечная недостаточность', color: '#7F1D1D', bg: '#FEE2E2' };
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="calculator" size={24} color="#007AFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Cockcroft–Gault</Text>
          <Text style={styles.subtitle}>Клиренс креатинина</Text>
        </View>
      </View>

      {/* Форма */}
      <View style={styles.card}>
        {/* Имя пациента */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Пациент</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              value={patientName} 
              onChangeText={setPatientName} 
              placeholder="Имя (необязательно)"
              placeholderTextColor="#CBD5E1"
            />
          </View>
        </View>

        {/* Вес */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Вес</Text>
          <View style={styles.rowInput}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <MaterialCommunityIcons name="weight-kilogram" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={weight} 
                onChangeText={setWeight} 
                keyboardType="numeric" 
                placeholder="70"
                placeholderTextColor="#CBD5E1"
              />
            </View>
            <View style={styles.unitToggle}>
              <Pressable 
                onPress={() => setWeightUnit('kg')} 
                style={[styles.unitBtn, weightUnit === 'kg' && styles.unitBtnActive]}
              >
                <Text style={[styles.unitText, weightUnit === 'kg' && styles.unitTextActive]}>kg</Text>
              </Pressable>
              <Pressable 
                onPress={() => setWeightUnit('lb')} 
                style={[styles.unitBtn, weightUnit === 'lb' && styles.unitBtnActive]}
              >
                <Text style={[styles.unitText, weightUnit === 'lb' && styles.unitTextActive]}>lb</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Возраст и креатинин в одну строку */}
        <View style={styles.rowDouble}>
          {/* Возраст */}
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Возраст</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={age} 
                onChangeText={setAge} 
                keyboardType="numeric" 
                placeholder="40"
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>

          {/* Креатинин */}
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Креатинин</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="water-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { paddingRight: 4 }]} 
                value={creatinine} 
                onChangeText={setCreatinine} 
                keyboardType="numeric" 
                placeholder="1.0"
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>
        </View>

        {/* Единицы креатинина */}
        <View style={[styles.unitToggle, { width: '100%', marginBottom: 16 }]}>
          <Pressable 
            onPress={() => setCreatinineUnit('mg/dL')} 
            style={[styles.unitBtn, { flex: 1 }, creatinineUnit === 'mg/dL' && styles.unitBtnActive]}
          >
            <Text style={[styles.unitText, creatinineUnit === 'mg/dL' && styles.unitTextActive]}>mg/dL</Text>
          </Pressable>
          <Pressable 
            onPress={() => setCreatinineUnit('umol/L')} 
            style={[styles.unitBtn, { flex: 1 }, creatinineUnit === 'umol/L' && styles.unitBtnActive]}
          >
            <Text style={[styles.unitText, creatinineUnit === 'umol/L' && styles.unitTextActive]}>µmol/L</Text>
          </Pressable>
        </View>

        {/* Пол */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Пол</Text>
          <View style={styles.genderToggle}>
            <Pressable 
              onPress={() => setFemale(false)} 
              style={[styles.genderBtn, !female && styles.genderBtnActive]}
            >
              <Ionicons 
                name="male" 
                size={20} 
                color={!female ? '#fff' : '#64748B'} 
              />
              <Text style={[styles.genderText, !female && styles.genderTextActive]}>Мужской</Text>
            </Pressable>
            <Pressable 
              onPress={() => setFemale(true)} 
              style={[styles.genderBtn, female && styles.genderBtnActive]}
            >
              <Ionicons 
                name="female" 
                size={20} 
                color={female ? '#fff' : '#64748B'} 
              />
              <Text style={[styles.genderText, female && styles.genderTextActive]}>Женский</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Кнопка расчёта */}
      <Pressable onPress={calculate}>
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.calculateBtn}
        >
          <Ionicons name="calculator" size={20} color="#fff" />
          <Text style={styles.calculateBtnText}>Рассчитать клиренс</Text>
        </LinearGradient>
      </Pressable>

      {/* Результат */}
      {result !== null && (
        (() => {
          const cat = classifyClCr(result);
          return (
            <View style={[styles.resultCard, { borderColor: cat.color, shadowColor: cat.color }] }>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color={cat.color} />
                <Text style={styles.resultTitle}>Результат</Text>
              </View>
              <View style={styles.resultValueContainer}>
                <Text style={[styles.resultValue, { color: cat.color }]}>{result}</Text>
                <Text style={styles.resultUnit}>mL/min</Text>
              </View>
              <View style={[styles.resultInfo, { backgroundColor: cat.bg }] }>
                <Ionicons name="information-circle-outline" size={16} color={cat.color} />
                <Text style={[styles.resultInfoText, { color: cat.color }]}>{cat.label}</Text>
              </View>
            </View>
          );
        })()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#F8FAFC',
    paddingBottom: 100
  },

  // Заголовок
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    flex: 1
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#0F172A',
    letterSpacing: -0.5
  },
  subtitle: { 
    color: '#64748B', 
    fontSize: 14,
    marginTop: 2
  },

  // Карточка формы
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },

  // Группы формы
  formGroup: { 
    marginBottom: 16
  },
  label: { 
    fontSize: 14, 
    color: '#475569', 
    marginBottom: 8,
    fontWeight: '600'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: { 
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#0F172A'
  },

  // Строка с двумя полями
  rowDouble: { 
    flexDirection: 'row',
    marginBottom: 0
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  // Переключатели единиц
  unitToggle: { 
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC'
  },
  unitBtn: { 
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unitBtnActive: { 
    backgroundColor: '#007AFF'
  },
  unitText: { 
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600'
  },
  unitTextActive: { 
    color: '#fff'
  },

  // Переключатель пола
  genderToggle: {
    flexDirection: 'row',
    gap: 8
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 6
  },
  genderBtnActive: {
    backgroundColor: '#8B5CF6'
  },
  genderText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600'
  },
  genderTextActive: {
    color: '#fff'
  },

  // Кнопка расчёта
  calculateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  calculateBtnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16
  },

  // Карточка результата
  resultCard: { 
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569'
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  resultValue: { 
    fontSize: 48, 
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1
  },
  resultUnit: {
    fontSize: 20,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '600'
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  resultInfoText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600'
  }
});