
📋 О проекте
Компонент «Очередь генераций» для платформы ERA2 — агрегатора нейросетей с 90+ моделями (текст, изображения, видео, аудио). Реализует "живой" экран очереди с эмуляцией работы генераций: задачи автоматически продвигаются по статусам, прогресс растёт в реальном времени, часть задач падает с ошибками.

Ссылка на макет: Figma — ERA2 Queue

🚀 Быстрый старт
Установка
bash
# Клонирование репозитория
git clone <https://github.com/aldeevN/era2.aiTestApp.git>
cd era2-queue

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Превью сборки
npm run preview
Требования
Node.js 18+

npm / yarn / pnpm

🏗️ Архитектура (FSD)
Проект построен по Feature-Sliced Design с чётким разделением ответственности:

text
src/
├── app/                          # Инициализация приложения
│   ├── providers/                # Провайдеры (Theme, Queue, Router)
│   └── styles/                   # Глобальные стили
│
├── pages/
│   └── QueuePage.tsx             # Тонкая страница, рендерит виджет
│
├── widgets/
│   └── generation-queue/
│       ├── ui/
│       │   └── GenerationQueue.tsx  # Композиция экрана
│       └── index.ts
│
├── features/
│   └── generation-queue/         # Основная бизнес-логика
│       ├── model/
│       │   ├── queueReducer.ts      # Конечный автомат статусов
│       │   ├── queueEngine.ts       # Мок-движок (тики, слоты, сбои)
│       │   ├── QueueProvider.tsx    # Context + useReducer
│       │   ├── selectors.ts         # Фильтры, сортировка, счётчики
│       │   └── useQueue.ts          # Публичный хук
│       ├── ui/
│       │   ├── TaskRow.tsx          # Строка для desktop
│       │   ├── TaskCard.tsx         # Карточка для mobile
│       │   ├── StatusBadge.tsx      # Бейдж статуса
│       │   ├── ProgressBar.tsx      # Прогресс-бар
│       │   ├── TaskActions.tsx      # Кнопки действий
│       │   ├── QueueStats.tsx       # 4 счётчика
│       │   ├── QueueToolbar.tsx     # Фильтры + сортировка + поиск
│       │   ├── GlobalStatusBar.tsx  # Плавающий индикатор
│       │   └── states/
│       │       ├── EmptyState.tsx
│       │       ├── LoadingState.tsx
│       │       └── ErrorState.tsx
│       ├── lib/
│       │   └── formatEta.ts         # Форматтеры времени
│       └── index.ts
│
├── entities/
│   └── generation-task/
│       ├── model/
│       │   ├── types.ts            # GenType, TaskStatus, GenerationTask
│       │   └── seed.ts             # Стартовый датасет (10 задач)
│       └── index.ts
│
└── shared/
    ├── ui/                         # UI-примитивы (Button, Chip, IconButton)
    ├── lib/
    │   └── cn.ts                   # Склейка классов (clsx + tailwind-merge)
    └── routing/                    # Навигация
Принципы FSD
Строгая иерархия: app → pages → widgets → features → entities → shared

Публичный API: каждый слайс экспортирует только то, что нужно через index.ts

Бизнес-логика в model/: редьюсеры, движок, селекторы

Компоненты "тупые": получают данные и колбэки через пропсы

⚙️ Мок-движок очереди
Реализован эмулятор работы очереди генераций:

Параметры
MAX_CONCURRENT = 2 — одновременно не более 2 задач в статусе running

FIFO — при освобождении слота берётся следующая queued по createdAt

Прогресс: тики каждые 400–700 мс, случайный шаг

Сбои: ~15% вероятность упасть в failed с одной из ошибок:

"Недостаточно кредитов"

"Превышено время ожидания"

"Модель временно недоступна"

Скорость зависит от типа:

text / image — быстрее (шаг 4-8)

audio / video — медленнее (шаг 1-3)

Конечный автомат статусов
text
queued → running → done
running → failed (случайный сбой)
running/queued → canceled (отмена пользователем)
failed/canceled → queued (повтор)
Особенности
✅ Корректная чистка таймеров при размонтировании

✅ При cancel — немедленная остановка без "дотиков"

✅ При восстановлении из localStorage — running → queued

✅ Единый источник правды через useReducer + Context

🎨 UI-функциональность
1. Шапка экрана
Заголовок "Очередь генераций" + подзаголовок

Кнопка "Очистить готовые" — удаляет все done задачи

2. Сводка (4 счётчика)
В очереди / Идёт / Готово / Ошибка

Реактивные значения, обновляются в реальном времени

3. Тулбар
Фильтр по статусу: Все · В очереди · Идёт · Готово · Ошибка

Сортировка: Сначала новые / Сначала старые

Поиск: по тексту промпта (debounce 300ms)

4. Список задач
Desktop: строки (TaskRow)

Mobile: карточки (TaskCard)

Для каждой задачи:

Иконка по типу (image/video/text/audio)

Промпт (с обрезкой)

Модель + мета (ETA/длительность/кредиты/позиция)

Статусный бейдж

Прогресс-бар для running (обновляется в реальном времени)

Действия: Отмена / Повтор / Скачать / Удалить

5. Состояния экрана
Loading: скелетоны (5 шт.)

Empty: осмысленное пустое состояние

Error: ошибка с кнопкой "Повторить"

6. Глобальный статус-бар
Показывается только при наличии активных задач

1 задача: компактная карточка с прогрессом

Несколько задач: виджет со списком 2-3 задач

Кнопка "Открыть очередь →" → переход на /queue

Адаптив:

Desktop/Tablet: плавающий снизу-справа

Mobile: полноширинная панель снизу

💾 Персистентность
Состояние очереди сохраняется в localStorage (ключ era2_queue)

Восстанавливается при перезагрузке страницы

running задачи при восстановлении → queued

Сохранение при каждом изменении

📱 Адаптив
Брейкпоинт	Отображение
Desktop (≥1024px)	Строки списка, статистика 4 колонки
Tablet (768-1024px)	Строки/карточки (не ломается)
Mobile (≤480px)	Карточки, статистика 2×2, чипы со скроллом
🧪 Технологии
Основные зависимости
json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.400.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
Сборка
Vite — быстрая сборка и HMR

ESLint — проверка кода

Prettier — форматирование

🎯 Реализованные фичи
Основные (обязательные)
Полная архитектура FSD

Мок-движок очереди (лимит 2, тики, сбои 15%)

Конечный автомат статусов

Фильтрация, сортировка, поиск

Адаптивная вёрстка (desktop/tablet/mobile)

Персистентность (localStorage)

Глобальный статус-бар

Все состояния (loading/empty/error)

TypeScript strict

Бонусные
Framer Motion анимации

Debounce для поиска

Плавное появление/удаление задач

Адаптация под prefers-reduced-motion

📁 Структура ключевых файлов
Типы (entities)
typescript
// src/entities/generation-task/model/types.ts
export type GenType = "image" | "video" | "text" | "audio";
export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface GenerationTask {
  id: string;
  type: GenType;
  prompt: string;
  model: string;
  status: TaskStatus;
  progress: number;
  createdAt: number;
  credits: number;
  etaSeconds?: number;
  durationSeconds?: number;
  queuePosition?: number;
  errorMessage?: string;
}
Редьюсер (features)
typescript
// src/features/generation-queue/model/queueReducer.ts
export type Action =
  | { type: "INIT"; tasks: GenerationTask[] }
  | { type: "TICK"; id: string; progress: number }
  | { type: "COMPLETE"; id: string }
  | { type: "FAIL"; id: string; message: string }
  | { type: "START"; id: string }
  | { type: "CANCEL"; id: string }
  | { type: "RETRY"; id: string }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_DONE" };
Движок (features)
typescript
// src/features/generation-queue/model/queueEngine.ts
const MAX_CONCURRENT = 2;
const FAIL_CHANCE_PER_TICK = 0.15;
const TICK_INTERVAL: Record<GenType, [number, number]> = {
  text: [300, 500],
  image: [450, 750],
  audio: [600, 1000],
  video: [900, 1500],
};

Работа с состоянием
typescript
// В компоненте
const { state, dispatch } = useQueue();

// Отправка действия
dispatch({ type: "CANCEL", id: taskId });

// Чтение данных
const tasks = state.tasks;
const loading = state.loading;

📧 Контакты
Автор: [Алдеев Нургали]

Email: [aldeev33@gmail.com]

Telegram: [@aldeevn]