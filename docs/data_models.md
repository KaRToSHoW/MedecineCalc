# Модели данных

Ниже — основные модели, которыми обмениваются сущности.

## Doctor / User (profile)
- `uid` (string, from Firebase Auth)
- `name` (string)
- `clinic` (string | null)
- `specialty` (string | null)
- `contact` (string | null)

Stored at: `users/{uid}/meta/profile`

## HistoryEntry (расчёт)
- `id` (Firestore auto-id)
- `patientName` (string | null)
- `weightRaw` (number) — введённое значение
- `weightUnit` ("kg" | "lb")
- `weightKg` (number) — нормализованное значение (kg)
- `age` (number)
- `creatinineRaw` (number)
- `creatinineUnit` ("mg/dL" | "umol/L")
- `creatinineMgDl` (number) — нормализованное mg/dL
- `female` (boolean)
- `result` (number) — ml/min
- `createdAt` (timestamp)

Stored at: `users/{uid}/history/{docId}`

## Примеры использования моделей
- Клиент сохраняет `weightRaw` и `weightUnit` одновременно с `weightKg` для прозрачности; отображение истории показывает значения и единицы.
