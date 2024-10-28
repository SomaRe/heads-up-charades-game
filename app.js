// Default game settings
const DEFAULT_WORDS = [
    "Tata", "Reliance", "Mahindra", "Bajaj", "Amul",
    "Flipkart", "Paytm", "Britannia", "Patanjali", "Dabur",
    "Asian Paints", "Hero", "Airtel", "Jio", "Parle",
    "Haldiram's", "Mother Dairy", "Godrej", "HUL", "ITC"
].join('\n');

const DEFAULT_TIME = 90;

// Game state
let gameState = {
    isPlaying: false,
    timeLeft: DEFAULT_TIME,
    questionsLeft: 20,
    score: 0,
    words: [],
    currentWord: "",
    timer: null,
    lastTap: 0
};

// DOM Elements
const elements = {
    startButton: document.getElementById('startButton'),
    exitButton: document.getElementById('exitButton'),
    settingsButton: document.getElementById('settingsButton'),
    settingsPanel: document.getElementById('settingsPanel'),
    gameArea: document.getElementById('gameArea'),
    wordDisplay: document.getElementById('wordDisplay'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    feedback: document.getElementById('feedback'),
    gameWords: document.getElementById('gameWords'),
    gameTime: document.getElementById('gameTime'),
    saveSettings: document.getElementById('saveSettings'),
    resetSettings: document.getElementById('resetSettings')
};

// Load settings from localStorage
function loadSettings() {
    const savedWords = localStorage.getItem('gameWords') || DEFAULT_WORDS;
    const savedTime = localStorage.getItem('gameTime') || DEFAULT_TIME;
    
    elements.gameWords.value = savedWords;
    elements.gameTime.value = savedTime;
    gameState.words = savedWords.split('\n').filter(word => word.trim());
    gameState.timeLeft = parseInt(savedTime);
}

// Save settings to localStorage
function saveSettings() {
    const words = elements.gameWords.value;
    const time = elements.gameTime.value;
    
    localStorage.setItem('gameWords', words);
    localStorage.setItem('gameTime', time);
    
    gameState.words = words.split('\n').filter(word => word.trim());
    gameState.timeLeft = parseInt(time);
    
    showFeedback('Settings saved!');
    elements.settingsPanel.classList.remove('active');
}

// Reset settings to default
function resetSettings() {
    elements.gameWords.value = DEFAULT_WORDS;
    elements.gameTime.value = DEFAULT_TIME;
    saveSettings();
    showFeedback('Settings reset to default!');
}

// Show feedback message
function showFeedback(message) {
    elements.feedback.textContent = message;
    elements.feedback.classList.add('active');
    setTimeout(() => {
        elements.feedback.classList.remove('active');
    }, 1000);
}

// Pick a random word
function pickNewWord() {
    const randomIndex = Math.floor(Math.random() * gameState.words.length);
    gameState.currentWord = gameState.words[randomIndex];
    elements.wordDisplay.textContent = gameState.currentWord;
}

// Handle answer (correct or skip)
function handleAnswer(correct) {
    if (!gameState.isPlaying) return;
    
    if (correct) {
        gameState.score++;
        showFeedback('Correct! ✅');
    } else {
        showFeedback('Skipped ⏭️');
    }
    
    gameState.questionsLeft--;
    elements.score.textContent = `Questions left: ${gameState.questionsLeft}`;
    
    if (gameState.questionsLeft > 0) {
        pickNewWord();
    } else {
        endGame();
    }
}

// Start the game
function startGame() {
    gameState.isPlaying = true;
    gameState.timeLeft = parseInt(elements.gameTime.value);
    gameState.questionsLeft = 20;
    gameState.score = 0;
    
    elements.startButton.style.display = 'none';
    elements.wordDisplay.style.display = 'block';
    
    pickNewWord();
    startTimer();
}

// Start the timer
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        elements.timer.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    elements.wordDisplay.textContent = `Game Over!\nScore: ${gameState.score}/${20-gameState.questionsLeft}`;
    elements.startButton.style.display = 'block';
    elements.startButton.textContent = 'Play Again';
}

// Handle tap events
function handleTap(e) {
    if (!gameState.isPlaying) return;
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - gameState.lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        handleAnswer(true);
        gameState.lastTap = 0;
    } else {
        // Single tap
        gameState.lastTap = currentTime;
        
        // If no second tap after 300ms, consider it a single tap
        setTimeout(() => {
            if (currentTime === gameState.lastTap) {
                handleAnswer(false);
                gameState.lastTap = 0;
            }
        }, 300);
    }
}

// Handle exit game
function exitGame() {
    if (gameState.isPlaying) {
        gameState.isPlaying = false;
        clearInterval(gameState.timer);
        elements.startButton.style.display = 'block';
        elements.startButton.textContent = 'Start Game';
        elements.wordDisplay.textContent = '';
        elements.timer.textContent = elements.gameTime.value;
        elements.score.textContent = 'Questions left: 20';
    }
}

// Register service worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    registerServiceWorker();
    
    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => e.preventDefault());
    document.addEventListener('touchmove', (e) => e.preventDefault());
    
    // Game controls
    elements.startButton.addEventListener('click', startGame);
    elements.exitButton.addEventListener('click', exitGame);
    elements.gameArea.addEventListener('click', handleTap);
    
    // Settings controls
    elements.settingsButton.addEventListener('click', () => {
        elements.settingsPanel.classList.add('active');
    });
    
    elements.saveSettings.addEventListener('click', saveSettings);
    elements.resetSettings.addEventListener('click', resetSettings);
});

// Handle visibility change (pause game when tab/app is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.isPlaying) {
        exitGame();
    }
});

// Handle PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});