// ストップウォッチの状態を管理するオブジェクト
const stopwatches = {};

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

function createStopwatch(type, addResultCallback) {
    const display = document.getElementById(`stopwatchDisplay${type}`);
    const startStopBtn = document.getElementById(`stopwatchStartStop${type}`);
    const actionButtons = document.getElementById(`auto-buttons-${type.toLowerCase()}`);
    const conditionInput = document.getElementById(`input${type}ExpAuto${type === 'Length' ? 1 : type === 'Weight' ? 2 : 3}`);
    const recordBtn = actionButtons.querySelector('.add-result-btn');
    const resetBtn = actionButtons.querySelector('.reset-timer-btn');

    stopwatches[type] = {
        isRunning: false,
        startTime: 0,
        elapsedTime: 0,
        intervalId: null,
    };

    function updateDisplay() {
        const sw = stopwatches[type];
        const now = Date.now();
        sw.elapsedTime = now - sw.startTime;
        display.textContent = formatTime(sw.elapsedTime);
    }

    function start() {
        const sw = stopwatches[type];
        if (sw.isRunning) return;
        sw.isRunning = true;
        sw.startTime = Date.now() - sw.elapsedTime;
        sw.intervalId = setInterval(updateDisplay, 10);
        startStopBtn.textContent = 'ストップ';
        startStopBtn.classList.add('stopped');
        actionButtons.classList.add('hidden');
    }

    function stop() {
        const sw = stopwatches[type];
        if (!sw.isRunning) return;
        sw.isRunning = false;
        clearInterval(sw.intervalId);
        startStopBtn.textContent = 'スタート';
        startStopBtn.classList.remove('stopped');
        actionButtons.classList.remove('hidden');
    }

    function reset() {
        const sw = stopwatches[type];
        // isRunningの状態に関わらずタイマーを止める
        if (sw.intervalId) {
            clearInterval(sw.intervalId);
        }
        sw.isRunning = false;
        sw.elapsedTime = 0;
        display.textContent = '00:00.00';
        actionButtons.classList.add('hidden');
        startStopBtn.textContent = 'スタート';
        startStopBtn.classList.remove('stopped');
    }

    startStopBtn.addEventListener('click', () => {
        const sw = stopwatches[type];
        sw.isRunning ? stop() : start();
    });

    recordBtn.addEventListener('click', () => {
        const sw = stopwatches[type];
        const timeInSeconds = sw.elapsedTime / 1000;
        const expType = recordBtn.dataset.expType;
        
        addResultCallback(expType, conditionInput.value, timeInSeconds);
        reset();
    });
    
    resetBtn.addEventListener('click', reset);
}

export function initializeStopwatches(addResultCallback) {
    createStopwatch('Length', addResultCallback);
    createStopwatch('Weight', addResultCallback);
    createStopwatch('Amplitude', addResultCallback);
}