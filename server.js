// server.js — точка входа PawCare v2
// Настройка Express, middleware, маршруты, запуск

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const { initDb }                              = require('./db/database');
const { errorHandler, requestLogger }         = require('./middleware');

const app  = express();
const PORT = process.env.PORT || 3000;

// ===== БЕЗОПАСНОСТЬ =====
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'",
        "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net",
        "https://api-maps.yandex.ru", "https://yandex.ru"],
      styleSrc:   ["'self'", "'unsafe-inline'",
        "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc:     ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://openrouter.ai", "https://api.openai.com",
        "https://generativelanguage.googleapis.com",
        "https://ngw.devices.sberbank.ru:9443",
        "https://gigachat.devices.sberbank.ru",
        "https://geocode-maps.yandex.ru", "https://search-maps.yandex.ru"],
      frameSrc:   ["'self'", "https://yandex.ru"],
    }
  }
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 150,
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true, legacyHeaders: false,
}));
app.use('/api/ai/', rateLimit({
  windowMs: 60 * 60 * 1000, max: 25,
  message: { error: 'Превышен лимит запросов к ИИ (25/час)' }
}));

// ===== MIDDLEWARE =====
app.use(requestLogger);          // логи запросов в консоль
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ===== МАРШРУТЫ =====
app.use('/api/pets',      require('./routes/pets'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/weight',    require('./routes/weight'));
app.use('/api/ai',        require('./routes/ai'));

// Конфигурация для фронтенда (публичные данные)
app.get('/api/config', (req, res) => {
  res.json({
    yandexMapsKey: process.env.YANDEX_MAPS_KEY || '',
    hasAI: !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GIGACHAT_CREDENTIALS),
    aiProvider: process.env.AI_PROVIDER || 'openrouter'
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Глобальный обработчик ошибок (ПОСЛЕДНИЙ)
app.use(errorHandler);

// ===== ЗАПУСК =====
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🐾  PawCare v2 запущен!               ║
║   http://localhost:${PORT}                 ║
║                                          ║
║   AI провайдер: ${(process.env.AI_PROVIDER || 'openrouter').padEnd(22)}║
╚══════════════════════════════════════════╝`);
  });
}).catch(err => {
  console.error('❌ Ошибка запуска:', err.message);
  process.exit(1);
});
