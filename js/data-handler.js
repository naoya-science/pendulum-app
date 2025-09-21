import { db } from './firebase-init.js';
import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showMessage } from './ui.js';

// チャートのインスタンスを保持するオブジェクト
const charts = {};
// リアルタイムデータを保持するオブジェクト
const realTimeData = {};

// チャートを作成する関数
function createChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `1往復の平均時間 (秒)`,
                data: [],
                borderColor: color,
                backgroundColor: `${color}33`,
                tension: 0.1,
                fill: true,
                pointBackgroundColor: color,
                pointRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: '時間 (秒)' } },
                x: { title: { display: true, text: label } }
            }
        }
    });
}

// チャートとテーブルを更新する関数
function updateDisplay(tableId, canvasId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const sortedData = Object.entries(data).sort((a, b) => Number(a[0]) - Number(b[0]));

    const labels = [];
    const chartData = [];

    for (const [key, value] of sortedData) {
        const row = tableBody.insertRow();
        const times = value.times || [];
        const validTimes = times.filter(t => typeof t === 'number' && t > 0);
        const avg = validTimes.length > 0 ? (validTimes.reduce((a, b) => a + b, 0) / validTimes.length) : 0;
        const period = avg > 0 ? (avg / 10) : 0;

        row.innerHTML = `
            <td>${key}</td>
            <td>${times[0] ? times[0].toFixed(2) : '-'}</td>
            <td>${times[1] ? times[1].toFixed(2) : '-'}</td>
            <td>${times[2] ? times[2].toFixed(2) : '-'}</td>
            <td>${avg > 0 ? avg.toFixed(2) : '-'}</td>
            <td><b>${period > 0 ? period.toFixed(2) : '-'}</b></td>
        `;
        
        labels.push(key);
        chartData.push(period);
    }

    const chart = charts[canvasId];
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = chartData;
        chart.update();
    }
}

// データハンドラを初期化
export function initializeDataHandlers(userId) {
    const expTypes = [
        { name: 'length', label: '長さ (cm)', color: '#3b82f6', chartId: 'lengthChart', tableId: 'lengthTable' },
        { name: 'weight', label: '重さ (g)', color: '#16a34a', chartId: 'weightChart', tableId: 'weightTable' },
        { name: 'amplitude', label: 'ふれはば (°)', color: '#f97316', chartId: 'amplitudeChart', tableId: 'amplitudeTable' }
    ];

    // 各実験タイプに対してチャートとリスナーを設定
    expTypes.forEach(({ name, label, color, chartId, tableId }) => {
        createChart(chartId, label, color);
        
        const docRef = doc(db, 'users', userId, 'experiments', name);
        onSnapshot(docRef, (docSnap) => {
            const data = docSnap.exists() ? docSnap.data() : {};
            realTimeData[name] = data; // リアルタイムデータを保持
            updateDisplay(tableId, chartId, data);
        });
    });

    // 結果を追加する関数
    async function addResult(expType, condition, time) {
        const typeName = expType.split('-')[0];
        const messageBoxId = `messageBox${expType.includes('manual') ? 'Manual' : 'Auto'}`;

        if (isNaN(time) || time <= 0) {
            showMessage(messageBoxId, '有効な時間を入力してください。');
            return;
        }

        const docRef = doc(db, 'users', userId, 'experiments', typeName);
        
        try {
            // 現在のデータを取得（onSnapshotで保持しているリアルタイムデータを使用）
            const currentData = realTimeData[typeName] || {};
            const currentTimes = currentData[condition]?.times || [];

            // 3回までのデータを保持
            const newTimes = [...currentTimes, time];
            if (newTimes.length > 3) {
                newTimes.shift(); // 古いデータから削除
            }
            
            // 更新するデータを作成
            const dataToSet = {
                ...currentData,
                [condition]: {
                    times: newTimes
                }
            };
            
            await setDoc(docRef, dataToSet);
            showMessage(messageBoxId, '記録しました！', false);

        } catch (error) {
            console.error("Error adding document: ", error);
            showMessage(messageBoxId, '記録に失敗しました。');
        }
    }
    
    // 手動入力フォームのイベントリスナー
    document.querySelectorAll('.add-result-btn[data-exp-type$="-manual"]').forEach(button => {
        button.addEventListener('click', () => {
            const expType = button.dataset.expType;
            const form = button.closest('div');
            const conditionInput = form.querySelector('input[type="range"]');
            const timeInput = form.querySelector('input[type="number"]');
            
            addResult(expType, conditionInput.value, parseFloat(timeInput.value));
            timeInput.value = '';
        });
    });
    
    return { addResult };
}