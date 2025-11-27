class TelegramDice {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.initTelegramApp();
        
        this.dice = document.getElementById('dice');
        this.rollButton = document.getElementById('rollButton');
        this.resultElement = document.getElementById('result');
        this.totalRollsElement = document.getElementById('totalRolls');
        this.lastRollsElement = document.getElementById('lastRolls');
        
        this.totalRolls = 0;
        this.lastRolls = [];
        this.isRolling = false;
        
        this.initializeEventListeners();
        this.loadFromStorage();
        this.updateDisplay();
        
        // Устанавливаем начальное значение
        this.setDiceValue(1);
    }
    
    initTelegramApp() {
        // Инициализируем Telegram Web App
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        
        // Устанавливаем цветовую схему
        this.applyTheme();
        
        // Сообщаем Telegram, что приложение готово
        this.tg.ready();
    }
    
    applyTheme() {
        const themeParams = this.tg.themeParams;
        document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color || '#f0f0f0');
    }
    
    initializeEventListeners() {
        this.rollButton.addEventListener('click', () => this.rollDice());
        
        // Бросок кубика по нажатию пробела
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !this.isRolling) {
                event.preventDefault();
                this.rollDice();
            }
        });
        
        // Обработка касаний для мобильных устройств
        this.dice.addEventListener('click', () => {
            if (!this.isRolling) {
                this.rollDice();
            }
        });
    }
    
    rollDice() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.rollButton.disabled = true;
        
        // Скрываем точки во время анимации
        this.dice.classList.add('hidden-dots');
        
        // Анимация вращения
        this.dice.classList.add('rolling');
        this.resultElement.textContent = '?';
        this.resultElement.classList.remove('result-pop');
        
        // Генерируем случайное число
        const result = Math.floor(Math.random() * 6) + 1;
        
        console.log('Выпало число:', result); // Для отладки
        
        // Задержка для анимации - устанавливаем значение ПОСЛЕ анимации
        setTimeout(() => {
            this.showResult(result);
        }, 800);
    }
    
    showResult(result) {
        // Завершаем анимацию
        this.dice.classList.remove('rolling');
        
        // Убираем скрытие точек и устанавливаем новое значение
        setTimeout(() => {
            this.dice.classList.remove('hidden-dots');
            this.setDiceValue(result);
            
            // Обновляем данные
            this.totalRolls++;
            this.lastRolls.unshift(result);
            if (this.lastRolls.length > 5) {
                this.lastRolls.pop();
            }
            
            // Обновляем отображение
            this.resultElement.textContent = result;
            this.resultElement.classList.add('result-pop');
            
            // Вибрация (если поддерживается)
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
            
            // Сохраняем в localStorage
            this.saveToStorage();
            this.updateDisplay();
            
            this.isRolling = false;
            this.rollButton.disabled = false;
        }, 100);
    }
    
    setDiceValue(value) {
        // Убедимся, что значение в пределах 1-6
        const diceValue = Math.max(1, Math.min(6, value));
        this.dice.setAttribute('data-value', diceValue.toString());
        
        // Лог для отладки
        console.log('Установлено значение кубика:', diceValue);
    }
    
    updateDisplay() {
        this.totalRollsElement.textContent = this.totalRolls.toString();
        this.lastRollsElement.textContent = this.lastRolls.slice(0, 3).join(', ');
    }
    
    saveToStorage() {
        try {
            const data = {
                totalRolls: this.totalRolls,
                lastRolls: this.lastRolls
            };
            localStorage.setItem('telegramDiceData', JSON.stringify(data));
        } catch (e) {
            console.log('Ошибка сохранения:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('telegramDiceData');
            if (saved) {
                const data = JSON.parse(saved);
                this.totalRolls = data.totalRolls || 0;
                this.lastRolls = data.lastRolls || [];
                
                // Восстанавливаем последний результат если есть
                if (this.lastRolls.length > 0) {
                    this.setDiceValue(this.lastRolls[0]);
                }
            }
        } catch (e) {
            console.log('Ошибка загрузки:', e);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, запущено ли в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        window.diceApp = new TelegramDice();
    } else {
        // Fallback для тестирования вне Telegram
        console.log('Запуск вне Telegram');
        window.diceApp = new TelegramDice();
    }
});
