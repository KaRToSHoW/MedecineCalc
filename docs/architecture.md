# Архитектура системы

Ниже — декомпозиция и описание компонентов приложения.

1) Декомпозиция на подзадачи
- UI: экраны (Calculator, History, Profile, Dashboard, Auth).
- Persistence: запись и чтение истории и профиля — Firestore.
- Auth: Firebase Auth (email/password).
- Integrations: (опционально) аналитика, экспорт, PDF-экспорт.

2) Сущности
- Пользователи: `Doctor` (аккаунт Firebase Auth).
- Данные: `HistoryEntry` (расчёт), `Profile` (meta), Firestore database.
- Клиент: Expo app (React Native).

3) Модели данных (см. `data_models.md`)

4) Механизмы взаимодействия
- Клиент → Firestore (writes): при расчёте `addDoc(users/{uid}/history)`.
- Firestore → Клиент (reads): `onSnapshot` подписка на коллекцию истории.
- Auth flow: `onAuthStateChanged` переключает стек навигации.

5) UML-диаграмма
- Файл `architecture.puml` содержит диаграмму компонентов (подключается PlantUML для визуализации).
