import { userIdPromise } from './firebase-init.js';
import { initializeUI } from './ui.js';
import { initializeStopwatches } from './stopwatch.js';
import { initializeDataHandlers } from './data-handler.js';
import { initializeSimulation } from './simulation.js';

// DOMが読み込まれたら処理を開始
document.addEventListener('DOMContentLoaded', async () => {
    // ユーザーIDを取得して表示
    const userId = await userIdPromise;
    document.getElementById('userIdDisplay').textContent = userId;

    // 各モジュールを初期化
    initializeUI();
    initializeDataHandlers(userId); // データハンドラにuserIdを渡す
    initializeStopwatches(userId);
    initializeSimulation();

    console.log("Application initialized successfully.");
});