# 🔐 Kairos Password Generator

![Firefox Add-on](https://img.shields.io/amo/v/kairos-password-generator?label=Firefox&color=orange)
![GitHub](https://img.shields.io/github/v/release/flinteus/kairos)
![License](https://img.shields.io/github/license/flinteus/kairos)
![GitHub stars](https://img.shields.io/github/stars/flinteus/kairos)

Безопасный генератор паролей для Firefox и Chrome. Создавайте криптографически стойкие пароли прямо в браузере.

## ✨ Возможности

✅ **Криптографически безопасная генерация** - использует Web Crypto API  
✅ **Настройка параметров** - длина, типы символов, исключение похожих символов  
✅ **Визуальная оценка сложности** - индикатор силы пароля  
✅ **История паролей** - локальное хранение последних паролей  
✅ **Темная/светлая тема** - автоматическое переключение  
✅ **Работает офлайн** - не требует интернет-соединения  
✅ **Бесплатно и открытый исходный код**  

## 🖼️ Скриншоты

Тёмная тема:

<img width="564" height="836" alt="изображение" src="https://github.com/user-attachments/assets/77577921-d3c8-4764-85df-415f8e643bf5" />

<img width="557" height="836" alt="изображение" src="https://github.com/user-attachments/assets/17857a7a-a95b-4c0c-ba19-60c4ca1fdd3c" />

Светлая тема:

<img width="575" height="840" alt="изображение" src="https://github.com/user-attachments/assets/12b247d8-5dfa-4258-b9d1-87be72f8dce9" />

<img width="566" height="841" alt="изображение" src="https://github.com/user-attachments/assets/89c826ba-aaee-4060-83bb-7adf43ebdaab" />


## 🚀 Установка

### Для Firefox
1. Перейдите на [Firefox Add-ons](https://addons.mozilla.org/ru/firefox/addon/kairos-password-generator/)
2. Нажмите "Добавить в Firefox"

### Для Chrome/Edge
1. Скачайте репозиторий
2. Откройте `chrome://extensions/`
3. Включите "Режим разработчика"
4. Нажмите "Загрузить распакованное расширение"
5. Выберите папку с файлами

### Для разработчиков
```bash
git clone https://github.com/flinteus/kairos
cd kairos
# Используйте manifest.json для установки
```

### 🔧 Использование

  1.Нажмите на иконку расширения в панели инструментов

  2.Настройте параметры пароля:

   * Длина (6-32 символа)

   * Типы символов: заглавные, строчные, цифры, спецсимволы

   * Исключить похожие: i, l, 1, o, 0

  3.Нажмите "Сгенерировать пароль"

  4.Нажмите кнопку копирования для использования

🛠️ Технические детали
Безопасность:

  Использует crypto.getRandomValues() для криптографически стойкой генерации

  Локальное хранение в localStorage

  Content Security Policy: script-src 'self'

Архитектура:

  Frontend: HTML/CSS/JavaScript (Vanilla JS)

  Manifest: V2 для Firefox, V3 для Chrome

  Стили: CSS с CSS Variables для тем

Разрешения:

  clipboardWrite - копирование паролей

  storage - локальное сохранение настроек и истории


🤝 Участие в разработке

Приветствуются пул-реквесты и issue reports!

  Форкните репозиторий

  1. Создайте ветку для фичи (git checkout -b feature/amazing-feature)

  2. Зафиксируйте изменения (git commit -m 'Add amazing feature')

  3. Запушьте в ветку (git push origin feature/amazing-feature)

  4. Откройте Pull Request

📄 Лицензия

Этот проект распространяется под лицензией MIT. См. LICENSE для подробностей.
📞 Поддержка

Нашли баг или есть предложение? Создайте issue
