document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const passwordOutput = document.getElementById('passwordOutput');
    const copyBtn = document.getElementById('copyBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const generateBtn = document.getElementById('generateBtn');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const uppercaseCheckbox = document.getElementById('uppercaseCheckbox');
    const lowercaseCheckbox = document.getElementById('lowercaseCheckbox');
    const numbersCheckbox = document.getElementById('numbersCheckbox');
    const symbolsCheckbox = document.getElementById('symbolsCheckbox');
    const excludeSimilarCheckbox = document.getElementById('excludeSimilar');
    const strengthText = document.getElementById('strengthText');
    const strengthBar = document.getElementById('strengthBar');
    const passwordHistory = document.getElementById('passwordHistory');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const notification = document.getElementById('notification');
    const themeToggle = document.querySelector('.ui-switch input[type="checkbox"]');

    // Наборы символов
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const uppercaseCharsNoSimilar = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Без I, O
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const lowercaseCharsNoSimilar = 'abcdefghijkmnpqrstuvwxyz'; // Без l, o
    const numberChars = '0123456789';
    const numberCharsNoSimilar = '23456789'; // Без 0, 1
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similarChars = 'il1Lo0';

    // Загружаем историю и настройки из localStorage
    let history = loadFromStorage('passwordHistory', []);
    const settings = loadFromStorage('passwordSettings', {
        length: 12,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: true
    });

    // Загружаем тему
    const isLightTheme = loadFromStorage('theme', false);
    if (themeToggle) {
        themeToggle.checked = isLightTheme;
        updateTheme(isLightTheme);
    }

    // Инициализация интерфейса
    initializeUI();

    // События
    lengthSlider.addEventListener('input', updateLengthValue);
    generateBtn.addEventListener('click', generatePassword);
    refreshBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPassword);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Добавляем сохранение настроек при изменении
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox, excludeSimilarCheckbox]
        .forEach(element => {
            element.addEventListener('change', saveSettings);
        });
    
    lengthSlider.addEventListener('change', saveSettings);

    // Инициализация
    renderHistory();
    generatePassword();

    // ===== ОСНОВНЫЕ ФУНКЦИИ =====

    function initializeUI() {
        // Восстанавливаем настройки
        lengthSlider.value = settings.length;
        lengthValue.textContent = settings.length;
        uppercaseCheckbox.checked = settings.uppercase;
        lowercaseCheckbox.checked = settings.lowercase;
        numbersCheckbox.checked = settings.numbers;
        symbolsCheckbox.checked = settings.symbols;
        excludeSimilarCheckbox.checked = settings.excludeSimilar;
    }

    function updateLengthValue() {
        lengthValue.textContent = lengthSlider.value;
    }

    function saveSettings() {
        const settings = {
            length: parseInt(lengthSlider.value),
            uppercase: uppercaseCheckbox.checked,
            lowercase: lowercaseCheckbox.checked,
            numbers: numbersCheckbox.checked,
            symbols: symbolsCheckbox.checked,
            excludeSimilar: excludeSimilarCheckbox.checked
        };
        saveToStorage('passwordSettings', settings);
    }

    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const includeUppercase = uppercaseCheckbox.checked;
        const includeLowercase = lowercaseCheckbox.checked;
        const includeNumbers = numbersCheckbox.checked;
        const includeSymbols = symbolsCheckbox.checked;
        const excludeSimilar = excludeSimilarCheckbox.checked;

        // Проверяем длину
        if (length < 6 || length > 32) {
            passwordOutput.textContent = 'Длина должна быть 6-32 символа';
            updatePasswordStrength('');
            return;
        }

        // Проверяем, что выбран хотя бы один набор символов
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            passwordOutput.textContent = 'Выберите хотя бы один тип символов';
            updatePasswordStrength('');
            return;
        }

        // Создаем набор доступных символов с учетом исключения похожих
        let chars = '';
        if (includeUppercase) {
            chars += excludeSimilar ? uppercaseCharsNoSimilar : uppercaseChars;
        }
        if (includeLowercase) {
            chars += excludeSimilar ? lowercaseCharsNoSimilar : lowercaseChars;
        }
        if (includeNumbers) {
            chars += excludeSimilar ? numberCharsNoSimilar : numberChars;
        }
        if (includeSymbols) {
            chars += symbolChars; // Спецсимволы
        }

        // Проверяем, что набор символов не пустой (может стать пустым после excludeSimilar)
        if (chars.length === 0) {
            passwordOutput.textContent = 'Нет доступных символов';
            updatePasswordStrength('');
            return;
        }

        // Генерируем пароль с использованием криптографически безопасного генератора
        let password = '';
        try {
            // Создаем массив криптографически безопасных случайных чисел
            const randomValues = new Uint32Array(length);
            crypto.getRandomValues(randomValues);
            
            for (let i = 0; i < length; i++) {
                const randomIndex = randomValues[i] % chars.length;
                password += chars[randomIndex];
            }
        } catch (error) {
            // Fallback на Math.random() если crypto API недоступен
            console.warn('Crypto API недоступен, используется Math.random()');
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                password += chars[randomIndex];
            }
        }

        // Гарантируем наличие выбранных типов символов
        password = ensureCharacterTypes(password, {
            includeUppercase,
            includeLowercase,
            includeNumbers,
            includeSymbols,
            excludeSimilar
        });

        // Отображаем пароль
        passwordOutput.textContent = password;

        // Обновляем оценку сложности
        updatePasswordStrength(password);

        // Добавляем в историю
        addToHistory(password);
        
        // Сохраняем настройки
        saveSettings();
    }

    function ensureCharacterTypes(password, options) {
        const { includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar } = options;
        
        // Определяем наборы символов для каждого типа
        const uppercaseSet = excludeSimilar ? uppercaseCharsNoSimilar : uppercaseChars;
        const lowercaseSet = excludeSimilar ? lowercaseCharsNoSimilar : lowercaseChars;
        const numberSet = excludeSimilar ? numberCharsNoSimilar : numberChars;
        
        // Проверяем, какие типы символов уже есть в пароле
        const hasUppercase = includeUppercase && password.split('').some(char => 
            excludeSimilar ? uppercaseSet.includes(char) : /[A-Z]/.test(char)
        );
        
        const hasLowercase = includeLowercase && password.split('').some(char => 
            excludeSimilar ? lowercaseSet.includes(char) : /[a-z]/.test(char)
        );
        
        const hasNumbers = includeNumbers && password.split('').some(char => 
            excludeSimilar ? numberSet.includes(char) : /[0-9]/.test(char)
        );
        
        const hasSymbols = includeSymbols && password.split('').some(char => 
            symbolChars.includes(char)
        );
        
        // Если все требуемые типы уже присутствуют, возвращаем пароль как есть
        if ((!includeUppercase || hasUppercase) &&
            (!includeLowercase || hasLowercase) &&
            (!includeNumbers || hasNumbers) &&
            (!includeSymbols || hasSymbols)) {
            return password;
        }
        
        // Собираем массивы символов для недостающих типов
        const missingTypes = [];
        
        if (includeUppercase && !hasUppercase) {
            missingTypes.push({
                chars: uppercaseSet,
                description: 'заглавная буква'
            });
        }
        
        if (includeLowercase && !hasLowercase) {
            missingTypes.push({
                chars: lowercaseSet,
                description: 'строчная буква'
            });
        }
        
        if (includeNumbers && !hasNumbers) {
            missingTypes.push({
                chars: numberSet,
                description: 'цифра'
            });
        }
        
        if (includeSymbols && !hasSymbols) {
            missingTypes.push({
                chars: symbolChars,
                description: 'спецсимвол'
            });
        }
        
        // Заменяем случайные символы на недостающие типы
        let passwordArray = password.split('');
        
        for (const type of missingTypes) {
            // Находим случайную позицию для замены
            let randomPosition;
            let attempts = 0;
            const maxAttempts = 10;
            
            do {
                randomPosition = Math.floor(Math.random() * passwordArray.length);
                attempts++;
                
                // Пропускаем позиции, где уже есть спецсимвол (чтобы не заменять их)
                if (attempts >= maxAttempts || !symbolChars.includes(passwordArray[randomPosition])) {
                    break;
                }
            } while (symbolChars.includes(passwordArray[randomPosition]) && attempts < maxAttempts);
            
            // Выбираем случайный символ из нужного набора
            const randomCharIndex = Math.floor(Math.random() * type.chars.length);
            passwordArray[randomPosition] = type.chars[randomCharIndex];
        }
        
        return passwordArray.join('');
    }

    function updatePasswordStrength(password) {
        if (!password || password.length === 0) {
            strengthText.textContent = '-';
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = '#777';
            return;
        }

        let score = 0;
        const length = password.length;

        // Оценка за длину (больший вес)
        if (length >= 6 && length <= 8) score += 1;
        else if (length >= 9 && length <= 12) score += 2;
        else if (length >= 13 && length <= 16) score += 3;
        else if (length > 16) score += 4;

        // Оценка за разнообразие символов
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^a-zA-Z0-9]/.test(password);

        const diversityScore = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
        score += diversityScore * 2; // Больший вес разнообразию

        // Штраф за последовательности и повторения
        const sequences = [
            '123', '234', '345', '456', '567', '678', '789',
            'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 
            'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 
            'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'
        ];
        
        let hasSequence = false;
        const passwordLower = password.toLowerCase();
        for (const seq of sequences) {
            if (passwordLower.includes(seq)) {
                hasSequence = true;
                break;
            }
        }
        
        const hasRepeatedChars = /(.)\1{2,}/.test(password); // 3+ одинаковых символа подряд
        
        if (hasSequence) score -= 1;
        if (hasRepeatedChars) score -= 2;

        // Бонус за длину более 14 символов
        if (length > 14) score += 1;

        // Ограничиваем оценку
        score = Math.max(1, Math.min(score, 10));

        // Определяем уровень сложности
        let strength, color, width;
        if (score <= 3) {
            strength = 'Слабый';
            color = '#f44336';
            width = '25%';
        } else if (score <= 5) {
            strength = 'Средний';
            color = '#ff9800';
            width = '50%';
        } else if (score <= 7) {
            strength = 'Хороший';
            color = '#4CAF50';
            width = '75%';
        } else {
            strength = 'Отличный';
            color = '#2196F3';
            width = '100%';
        }

        // Обновляем отображение
        strengthText.textContent = strength;
        strengthText.style.color = color;
        strengthBar.style.width = width;
        strengthBar.style.backgroundColor = color;
    }

    function copyPassword() {
        const password = passwordOutput.textContent;
        
        if (!password || password === 'Нажмите "Сгенерировать"' || 
            password.includes('Выберите') || password.includes('Нет доступных') ||
            password.includes('Длина должна быть')) {
            return;
        }

        navigator.clipboard.writeText(password).then(() => {
            showNotification('Пароль скопирован!');
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = password;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Пароль скопирован!');
        });
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    function addToHistory(password) {
        const timestamp = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        history.unshift({ password, timestamp });
        
        // Ограничиваем историю 10 последними паролями
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        saveToStorage('passwordHistory', history);
        renderHistory();
    }

    function renderHistory() {
        passwordHistory.innerHTML = '';
        
        if (history.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'История пуста';
            li.style.color = '#888';
            li.style.textAlign = 'center';
            li.style.fontStyle = 'italic';
            li.style.padding = '10px';
            passwordHistory.appendChild(li);
            return;
        }
        
        history.forEach(item => {
            const li = document.createElement('li');
            
            const passwordSpan = document.createElement('span');
            passwordSpan.textContent = item.password;
            passwordSpan.className = 'history-password';
            
            const timeSpan = document.createElement('span');
            timeSpan.textContent = item.timestamp;
            timeSpan.className = 'history-time';
            timeSpan.style.fontSize = '12px';
            timeSpan.style.color = '#a0a0a0';
            
            li.appendChild(passwordSpan);
            li.appendChild(timeSpan);
            
            // Добавляем возможность копировать из истории
            li.addEventListener('click', function() {
                navigator.clipboard.writeText(item.password).then(() => {
                    showNotification('Пароль скопирован!');
                });
            });
            
            passwordHistory.appendChild(li);
        });
    }

    function clearHistory() {
        if (confirm('Очистить всю историю паролей?')) {
            history = [];
            saveToStorage('passwordHistory', history);
            renderHistory();
            showNotification('История очищена');
        }
    }

    function toggleTheme() {
        const isLight = themeToggle.checked;
        updateTheme(isLight);
        saveToStorage('theme', isLight);
    }

    function updateTheme(isLight) {
        if (isLight) {
            document.body.classList.add('lightstyle');
        } else {
            document.body.classList.remove('lightstyle');
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    function saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            // Если localStorage переполнен, очищаем старые записи
            if (error.name === 'QuotaExceededError') {
                try {
                    // Оставляем только 5 последних паролей в истории
                    if (key === 'passwordHistory' && Array.isArray(value) && value.length > 5) {
                        const trimmedHistory = value.slice(0, 5);
                        localStorage.setItem(key, JSON.stringify(trimmedHistory));
                        showNotification('Очищена старая история для экономии памяти');
                    }
                } catch (e) {
                    console.error('Не удалось очистить localStorage:', e);
                }
            }
        }
    }

    function loadFromStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return defaultValue;
        }
    }
});

// ===== ОБРАБОТКА ПЕРЕКЛЮЧАТЕЛЯ ТЕМЫ =====
// (Оставляем для совместимости со старым кодом, но лучше использовать новый код выше)

let styleMode = localStorage.getItem('styleMode');
const styleToggle = document.querySelector('.ui-switch input[type="checkbox"]');

const enableLigtStyle = () => {
  document.body.classList.add('ligtstyle');
  localStorage.setItem('styleMode', 'ligt');
}

const disableLigtStyle = () => {
  document.body.classList.remove('ligtstyle');
  localStorage.setItem('styleMode', null);
}


styleToggle.addEventListener('click',() => {
  styleMode = localStorage.getItem('styleMode');
  if(styleMode !== 'ligt'){
    enableLigtStyle();
  } else {
    disableLigtStyle();
  }
});

if(
styleMode === 'ligt'){
  enableLigtStyle();
}
