# 🥗 NutriGPT — Frontend (Vue 3 + TypeScript + Vite)

Интерфейс персонализированного AI-сервиса планирования питания.
Production-ready Progressive Web App с поддержкой офлайн-режима, тёмной темы,
локальных push-уведомлений и адаптивной версткой для мобильных и десктопных устройств.

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (http://localhost:5173)
npm run dev

# Production-сборка
npm run build

# Предпросмотр production-сборки
npm run preview
```

Требуется Node.js **≥ 18** и npm **≥ 9** (или pnpm/yarn — по желанию).

---

## ⚙️ Переменные окружения

Создайте файл `.env` в корне фронта (или используйте `.env.example`):

| Переменная | Описание | Пример |
|------------|----------|--------|
| `VITE_API_URL` | URL бекенда Go (без `/api/v1`) | `http://localhost:8080` |
| `VITE_APP_NAME` | Название приложения (для PWA/titles) | `NutriGPT` |

Vite подхватывает только переменные, начинающиеся с `VITE_`.

---

## 🗂 Структура проекта

```
src/
├── api/              # HTTP-клиенты (axios) и эндпоинты
├── assets/styles/    # SCSS-переменные, global.scss, темы
├── components/       # Переиспользуемые компоненты
│   ├── common/       # BaseButton, BaseCard, LazyImage, SkeletonCard, EmptyState...
│   ├── auth/         # Формы логина/регистрации
│   ├── family/       # Семьи и участники
│   ├── mealPlan/     # Карточки блюд и календарь плана
│   ├── profile/      # Профиль/КБЖУ/оборудование
│   ├── recipe/       # Карточки рецептов
│   └── shoppingList/ # Списки покупок
├── composables/      # useAuth, useProfile, useTheme, useReminders, useConfirm...
├── directives/       # vLazy (IntersectionObserver-based lazy-loading)
├── layouts/          # DefaultLayout, AuthLayout
├── pages/            # Роуты 1-в-1
├── router/           # vue-router + guards
├── stores/           # Pinia-сторы (auth, recipe, mealPlan, shoppingList, family, notification, admin)
├── types/            # api.ts — типы для Go DTO
├── utils/            # formatters, pdf, валидаторы
├── App.vue
├── main.ts           # Регистрация PWA, директив, Pinia, Router
└── env.d.ts
```

---

## 🎨 Design system

Всё брендирование строится на CSS-переменных и SCSS-токенах в
`src/assets/styles/variables.scss` и `global.scss`:

- Цветовая палитра: primary (`#1A6B4B` — тёплый зелёный), accent (`#E8A849`), danger/warning/success.
- 4px spacing grid, типографика на Inter, 9 размеров радиусов, 7 уровней теней.
- Поддержка **dark mode** через CSS-переменные и `[data-theme="dark"]`.

### Переключение тёмной темы

Composable `useTheme()` (`src/composables/useTheme.ts`) управляет тремя режимами:
`light`, `dark`, `system`. Текущий выбор пользователь меняет кнопкой в хедере
(`DefaultLayout.vue`), состояние сохраняется в `localStorage`.

---

## 📱 PWA

Подключён `vite-plugin-pwa` + Workbox. Файлы:
- `public/favicon.svg` — иконка приложения (маскируемая).
- `index.html` — theme-color, viewport, OG-теги.
- `vite.config.ts` — манифест (name, short_name, start_url, display: standalone),
  runtime-кэширование API-ответов, картинок Pexels/LoremFlickr и Google Fonts.

После `npm run build` появляется `sw.js` + `manifest.webmanifest`.
Приложение устанавливается на мобильных/десктоп, работает офлайн, показывает
уведомление о готовом апдейте (`src/main.ts` → `virtual:pwa-register`).

---

## 🖼 Фотографии блюд

Изображения рецептов подгружаются **с бэкенда** (`RecipeResponse.image_url`) —
бэк обращается к **Pexels API** и фолбэком к **LoremFlickr** на основе
`image_query`, которое возвращает GPT-4.
Подробности — см. `README.md` в корне Go-проекта (`PEXELS_API_KEY`).

На клиенте для отображения используется компонент `<LazyImage>`:

```vue
<LazyImage
  :src="recipe.image_url"
  :alt="recipe.title"
  emoji="🍳"
  aspect="card"
/>
```

`LazyImage` оборачивает `<img v-lazy>` + показывает shimmer-скелет до загрузки
и emoji-fallback при ошибке. Директива `v-lazy` на `IntersectionObserver`
грузит изображение за 100 px до появления в вьюпорте.

---

## 🔔 Push-напоминания о приёмах пищи

`src/composables/useReminders.ts` — Web Notifications API + локальный
setInterval-тик каждые 20 секунд. Расписание хранится в `localStorage`
(ключ `nutrigpt.reminders.v1`).

На странице **Профиль** есть тумблер + 4 time-инпута (завтрак / обед / перекус / ужин)
и кнопка «Отправить тестовое уведомление». Permission запрашивается
автоматически при первом включении.

Для фоновой доставки (когда вкладка закрыта) можно в дальнейшем подключить
Push API + VAPID на бэке — публичный API composable совместим.

---

## 📄 Экспорт плана питания в PDF

`src/utils/pdf.ts` → `exportMealPlanPdf(plan, servings)`.
Открывает новую вкладку со стилизованным HTML «для печати» и вызывает
`window.print()`. Пользователь в нативном диалоге сохраняет как PDF
(кириллица работает без бандлинга шрифтов).

Кнопка «📄 Экспорт PDF» — на странице `/meal-plan/:id`.

---

## 💀 Skeleton-лоадеры и EmptyState

- `SkeletonCard` — shimmer-анимация на CSS-переменных, корректно работает в обеих темах.
- `EmptyState` — компонент с 6 анимированными SVG-вариантами
  (`recipes`, `plan`, `shopping`, `family`, `search`, `default`) вместо простых emoji.

---

## 🧭 Маршруты

| Путь | Страница | Auth |
|------|----------|:----:|
| `/login`, `/register` | Вход / регистрация | — |
| `/dashboard` | Главная | ✅ |
| `/profile` | Профиль + оборудование + напоминания | ✅ |
| `/recipes` | Рецепты (с фильтрами) | ✅ |
| `/recipes/:id` | Детали рецепта | ✅ |
| `/meal-plan` | Генерация плана | ✅ |
| `/meal-plan/history` | История планов | ✅ |
| `/meal-plan/:id` | Детальный план + экспорт PDF | ✅ |
| `/shopping-lists` | Списки покупок | ✅ |
| `/shopping-lists/:id` | Детальный список | ✅ |
| `/family`, `/family/:id` | Семьи | ✅ |
| `/admin` | Админка | ✅ (role: admin) |

Guards — `src/router/index.ts`. Невалидный JWT-токен автоматически рефрешится
через `axios`-interceptor (`src/api/client.ts`).

---

## 🧰 Полезные скрипты

```bash
npm run dev        # Dev-server с HMR
npm run build      # vue-tsc + vite build → dist/
npm run preview    # Локальный preview прод-сборки
npm run lint       # ESLint + autofix
npm run format     # Prettier
```

---

## 🏗 Архитектурные заметки

- **State**: Pinia со strict-typed сторами; `storeToRefs` для реактивности.
- **HTTP**: axios с глобальным interceptor, автоматический refresh токена
  при 401, экспоненциальный backoff для 5xx.
- **Типизация**: все DTO с бэка в `src/types/api.ts` — руками синхронизируем
  с Go `internal/dto/*.go`.
- **UI-состояния**: везде 4 состояния — loading (skeleton) / empty (EmptyState) / error / data.
- **Анимации**: Vue `<Transition>` для router-переходов, CSS-анимации
  для микро-интеракций, SVG SMIL для empty-states.
- **Accessibility**: семантические теги, ARIA-ярлыки на интерактивных
  элементах, focus-rings, контраст WCAG-AA.

---

## 🐳 Docker

```bash
docker build -t nutrigpt-frontend .
docker run -p 5173:80 nutrigpt-frontend
```

`Dockerfile` — multi-stage сборка: Node 18 для билда → nginx-alpine для раздачи.

---

## 📝 Лицензия

Проект разработан в рамках дипломной работы. Все права на продукт принадлежат автору.

— _NutriGPT Team, 2026_
