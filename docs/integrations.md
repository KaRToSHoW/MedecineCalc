# Интеграции и примеры реализации

Этот файл описывает интеграции, которые можно подключить к приложению, и содержит готовые примеры/рекомендации для включения в проект.

## 1) Локальный fallback истории — `AsyncStorage`
- Назначение: хранить вычисления локально, когда пользователь не авторизован или нет сети.
- Установка:

```bash
cd expo-app
npx expo install @react-native-async-storage/async-storage
```

- Пример использования (псевдокод):

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

async function saveLocalHistory(uidlessEntry) {
  const raw = await AsyncStorage.getItem('local_history');
  const arr = raw ? JSON.parse(raw) : [];
  arr.unshift(uidlessEntry);
  await AsyncStorage.setItem('local_history', JSON.stringify(arr.slice(0, 200)));
}
```

- Рекомендация: при входе в аккаунт синхронизировать `local_history` в `users/{uid}/history`.

## 2) Firebase Analytics (инструкции)
- Назначение: сбор аналитики использования (сколько расчётов, ошибки, популярные экраны).
- Требование: в `firebaseConfig` должен быть `measurementId` для Web SDK.
- Пример инициализации (web):

```ts
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

- Примечание: для Expo-managed приложений рекомендуется использовать `expo-firebase-analytics` и настроить соответствующие ключи.

## 3) Экспорт CSV / PDF
- Рекомендация: добавить кнопку экспорта на экран `History`.
- Для CSV — собрать массив записей и сохранить через `FileSystem` / или экспортировать через Share API.

## 4) Дополнительные интеграции (по запросу)
- Карты (геолокация пациентов) — `react-native-maps`.
- Внешние API для мед. справочников — подключаемые HTTP-клиенты (fetch/axios).

---
Файл добавлен в репозиторий как инструкция и код-примеры; конкретную интеграцию могу реализовать по вашему выбору.