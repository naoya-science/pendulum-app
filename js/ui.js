export function initializeUI() {
    // タブ機能
    const tabs = document.querySelectorAll('.tab-button');
    const sections = {
        'tab-record-manual': document.getElementById('record-manual-section'),
        'tab-record-auto': document.getElementById('record-auto-section'),
        'tab-simulate': document.getElementById('simulation-section'),
    };
    const dataSection = document.getElementById('data-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            Object.values(sections).forEach(s => s.classList.add('hidden'));
            
            if (sections[tab.id]) {
                sections[tab.id].classList.remove('hidden');
                // 「シミュレーション」タブ以外ではデータセクションを表示
                if (tab.id !== 'tab-simulate') {
                    dataSection.classList.remove('hidden');
                } else {
                    dataSection.classList.add('hidden');
                }
            }
        });
    });

    // 初期状態でデータセクションを表示
    dataSection.classList.remove('hidden');


    // スライダーの値表示更新
    const setupSlider = (sliderId, displayId, unit) => {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (slider && display) {
            slider.addEventListener('input', () => {
                display.textContent = slider.value + unit;
            });
        }
    };

    // 手動入力フォーム
    setupSlider('inputLengthExp1', 'lengthValueExp1', 'cm');
    setupSlider('inputWeightExp2', 'weightValueExp2', 'g');
    setupSlider('inputAmplitudeExp3', 'amplitudeValueExp3', '°');
    
    // 自動入力フォーム
    setupSlider('inputLengthExpAuto1', 'lengthValueExpAuto1', 'cm');
    setupSlider('inputWeightExpAuto2', 'weightValueExpAuto2', 'g');
    setupSlider('inputAmplitudeExpAuto3', 'amplitudeValueExpAuto3', '°');
    
    // シミュレーション
    setupSlider('simLength', 'simLengthValue', 'cm');
    setupSlider('simWeight', 'simWeightValue', 'g');
    setupSlider('simAmplitude', 'simAmplitudeValue', '°');
}

export function showMessage(id, text, isError = true) {
    const box = document.getElementById(id);
    if (!box) return;

    box.textContent = text;
    box.style.color = isError ? '#ef4444' : '#22c55e';
    box.classList.remove('hidden');
    setTimeout(() => {
        box.classList.add('hidden');
    }, 3000);
}