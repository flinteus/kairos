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

    // Наборы символов
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similarChars = 'il1Lo0';

    // Загружаем историю из localStorage
    let history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    renderHistory();

    // Обновляем отображение длины пароля
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Генерация пароля
    generateBtn.addEventListener('click', generatePassword);
    refreshBtn.addEventListener('click', generatePassword);

    // Копирование пароля
    copyBtn.addEventListener('click', copyPassword);

    // Очистка истории
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Генерируем пароль при загрузке
    generatePassword();

    // Функция генерации пароля
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const includeUppercase = uppercaseCheckbox.checked;
        const includeLowercase = lowercaseCheckbox.checked;
        const includeNumbers = numbersCheckbox.checked;
        const includeSymbols = symbolsCheckbox.checked;
        const excludeSimilar = excludeSimilarCheckbox.checked;

        // Проверяем, что выбран хотя бы один набор символов
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            passwordOutput.textContent = 'Выберите хотя бы один тип символов';
            updatePasswordStrength('');
            return;
        }

        // Создаем набор доступных символов
        let chars = '';
        if (includeUppercase) chars += uppercaseChars;
        if (includeLowercase) chars += lowercaseChars;
        if (includeNumbers) chars += numberChars;
        if (includeSymbols) chars += symbolChars;

        // Убираем похожие символы если нужно
        if (excludeSimilar) {
            chars = chars.split('').filter(char => !similarChars.includes(char)).join('');
        }

        // Генерируем пароль
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }

        // Отображаем пароль
        passwordOutput.textContent = password;

        // Обновляем оценку сложности
        updatePasswordStrength(password);

        // Добавляем в историю
        addToHistory(password);
    }

    // Функция оценки сложности пароля
    function updatePasswordStrength(password) {
        if (!password) {
            strengthText.textContent = '-';
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = '#777';
            return;
        }

        let score = 0;
        const length = password.length;

        // Оценка за длину
        if (length >= 6 && length <= 8) score += 1;
        else if (length >= 9 && length <= 12) score += 2;
        else if (length >= 13 && length <= 16) score += 3;
        else if (length > 16) score += 4;

        // Оценка за разнообразие символов
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^a-zA-Z0-9]/.test(password);

        let diversityScore = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
        score += diversityScore;

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

    // Функция копирования пароля
    function copyPassword() {
        const password = passwordOutput.textContent;
        
        if (!password || password === 'Нажмите "Сгенерировать"' || password.includes('Выберите')) {
            return;
        }

        // Используем Clipboard API для копирования
        navigator.clipboard.writeText(password).then(() => {
            showNotification('Пароль скопирован!');
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Пароль скопирован!');
        });
    }

    // Функция показа уведомления
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Функция добавления пароля в историю
    function addToHistory(password) {
        const timestamp = new Date().toLocaleTimeString();
        history.unshift({ password, timestamp });
        
        // Ограничиваем историю 10 последними паролями
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        renderHistory();
    }

    // Функция отображения истории
    function renderHistory() {
        passwordHistory.innerHTML = '';
        
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

    // Функция очистки истории
    function clearHistory() {
        if (confirm('Очистить всю историю паролей?')) {
            history = [];
            localStorage.removeItem('passwordHistory');
            renderHistory();
            showNotification('История очищена');
        }
    }
});

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
