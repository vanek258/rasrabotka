# 🐾 PawCare v2 — Дневник здоровья питомцев

Современное веб-приложение для учёта прививок, напоминаний, веса и консультаций
с ИИ-ветеринаром. Node.js + Express + SQLite. Glassmorphism-дизайн.

---

## 📁 Структура проекта

```
pawcare2/
├── server.js              ← точка входа, настройка Express + middleware
├── .env                   ← ваши API-ключи (создать из .env.example)
├── package.json
│
├── db/
│   ├── database.js        ← sql.js, хелперы queryAll/queryOne/run
│   └── seed.js            ← тестовые данные (2 питомца с историей)
│
├── middleware/
│   └── index.js           ← errorHandler, asyncWrap, validateId, requestLogger
│
├── routes/                ← только URL → контроллер (тонкий слой)
│   ├── pets.js
│   ├── reminders.js
│   ├── ai.js
│   └── weight.js
│
├── controllers/           ← HTTP-запрос → вызов сервиса/модели → JSON-ответ
│   ├── petsController.js
│   ├── remindersController.js
│   └── aiController.js
│
├── services/              ← бизнес-логика (независима от HTTP)
│   └── aiService.js       ← работа с ИИ-провайдерами + fallback
│
├── models/                ← работа с БД (только SQL)
│   ├── PetModel.js
│   ├── ReminderModel.js
│   └── WeightModel.js
│
├── utils/
│   └── helpers.js         ← escapeHtml, formatAge, dueStatus
│
└── public/                ← фронтенд (SPA без фреймворков)
    ├── index.html
    ├── css/style.css      ← Glassmorphism + Manrope + Inter
    └── js/
        ├── api.js         ← HTTP-клиент + toast + safe()
        ├── pets.js        ← страница питомцев + детали
        ├── reminders.js   ← события с группировкой по датам
        ├── ai.js          ← ИИ-помощник + маскот
        ├── map.js         ← Яндекс Карты
        ├── theme.js       ← тёмная/светлая тема
        └── app.js         ← SPA-навигация
```

---

## 🚀 Быстрый старт (Windows)

```bash
# 1. Распакуйте pawcare-v2.zip

# 2. Откройте терминал в папке pawcare2
# VS Code → Terminal → New Terminal

# 3. Установите зависимости
npm install

# 4. Создайте .env с ключами
copy .env.example .env

# 5. Вставьте API-ключ (см. ниже)
# Откройте .env в VS Code и заполните

# 6. [Опционально] Загрузите тестовые данные
npm run seed

# 7. Запустите
node server.js

# 8. Откройте браузер
# http://localhost:3000
```

---

## 🔑 API-ключи — пошагово

### ✅ OpenRouter (рекомендуется — бесплатно, без VPN)

1. Зайдите: **https://openrouter.ai**
2. **Sign In** → войдите через Google
3. **Keys → Create Key** → назовите `pawcare` → нажмите Create
4. Скопируйте ключ (показывается один раз!)
5. Вставьте в `.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-ваш_ключ_здесь
AI_PROVIDER=openrouter
```

Бесплатные модели (работают автоматически, указывать необязательно):
- `mistralai/mistral-7b-instruct:free`
- `google/gemma-3-4b-it:free`

### ✅ GigaChat (Сбер — тоже бесплатно, тоже без VPN)

1. Зайдите: **https://developers.sber.ru/studio**
2. Войдите через **Сбер ID**
3. **Создать проект → GigaChat API**
4. Раздел **Доступ → Авторизационные данные** → скопируйте длинную строку
5. Вставьте в `.env`:

```env
GIGACHAT_CREDENTIALS=длинная_строка_base64_из_кабинета
AI_PROVIDER=gigachat
```

> GigaChat даёт **1 000 000 токенов в месяц** бесплатно.

### Яндекс Карты (опционально)

1. Зайдите: **https://developer.tech.yandex.ru**
2. Создайте ключ для **JavaScript API и HTTP Геокодер**
3. В `.env`: `YANDEX_MAPS_KEY=ваш_ключ`

---

## 📄 Пример .env

```env
PORT=3000

# Выберите ОДИН вариант ИИ:
OPENROUTER_API_KEY=sk-or-v1-...
AI_PROVIDER=openrouter

# Или GigaChat:
# GIGACHAT_CREDENTIALS=...
# AI_PROVIDER=gigachat

# Яндекс Карты (опционально):
# YANDEX_MAPS_KEY=...
```

---

## 🏗️ Архитектура (MVC)

```
HTTP запрос
    ↓
routes/          ← только: URL + метод → контроллер
    ↓
controllers/     ← получить данные из req, вызвать model/service, отдать JSON
    ↓
models/ / services/  ← вся логика: SQL, работа с ИИ, обработка данных
    ↓
db/database.js   ← sql.js, хелперы
```

**Зачем это нужно?**
- Легко найти нужный код
- Можно поменять БД, не трогая роуты
- Можно поменять ИИ-провайдера в одном файле
- Легко тестировать каждый слой отдельно

---

## 🔒 Безопасность

| Защита | Реализация |
|--------|-----------|
| SQL-инъекции | Параметризованные запросы в каждом query |
| XSS | `textContent` на клиенте, `escapeHtml()` на сервере |
| CSRF-подобные атаки | Helmet CSP заголовки |
| Перегрузка API | Rate limit: 150 req/15мин, ИИ: 25 req/час |
| Большие файлы | Multer: лимит 5МБ, только изображения |
| Ключи в коде | Только `.env`, `.env` в `.gitignore` |

---

## 🐛 Решение частых проблем

| Проблема | Решение |
|----------|---------|
| `Cannot find module 'sql.js'` | `npm install` |
| `No endpoints found` | Убрать/изменить `OPENROUTER_MODEL` в `.env` |
| `OpenRouter вернул пустой ответ` | Перезапустить — код автоматически пробует другую модель |
| ИИ не отвечает | Проверить ключ, перезапустить `node server.js` |
| Редактировали `.env.example` | `copy .env.example .env` и заполнить `.env` |
| Порт занят | Изменить `PORT=3001` в `.env` |

---

## 🌐 Деплой на Render (бесплатно)

1. Создайте аккаунт на **https://github.com** и загрузите код
   ```bash
   git init
   git add .
   git commit -m "PawCare v2"
   # создайте репозиторий на github.com, затем:
   git remote add origin https://github.com/ВАШ_НИК/pawcare.git
   git push -u origin main
   ```
2. Зайдите на **https://render.com** → **New Web Service**
3. Подключите GitHub-репозиторий
4. Настройки:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. В разделе **Environment Variables** добавьте ключи из `.env`
6. Нажмите **Deploy** → через 2-3 минуты приложение доступно по ссылке

> ⚠️ На бесплатном тарифе Render база данных сбрасывается при каждом деплое.
> Для хранения данных нужен платный тариф или внешняя БД (например, Turso).

---

## ✨ Что можно добавить в будущем

- [ ] Авторизация (логин/пароль) с bcrypt + JWT
- [ ] Экспорт карточки питомца в PDF (puppeteer)
- [ ] Push-уведомления о напоминаниях (Service Worker)
- [ ] Многопользовательский режим (семейный доступ)
- [ ] Телеграм-бот с напоминаниями
