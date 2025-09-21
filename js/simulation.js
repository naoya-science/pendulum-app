export function initializeSimulation() {
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startSimBtn');
    const periodDisplay = document.getElementById('periodDisplay');

    const lengthSlider = document.getElementById('simLength');
    const amplitudeSlider = document.getElementById('simAmplitude');

    let animationId;

    function drawPendulum(angle) {
        const width = canvas.width;
        const height = canvas.height;
        const pivotX = width / 2;
        const pivotY = 20;
        const length = (parseFloat(lengthSlider.value) / 200) * (height - 40); // スケール調整
        const bobRadius = 15;

        const bobX = pivotX + length * Math.sin(angle);
        const bobY = pivotY + length * Math.cos(angle);

        ctx.clearRect(0, 0, width, height);
        
        // 振り子の糸
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 支点
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();

        // おもり
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#0d6efd';
        ctx.fill();
    }
    
    function startAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        const L = parseFloat(lengthSlider.value) / 100; // 長さ(m)
        const g = 9.8; // 重力加速度
        const period = 2 * Math.PI * Math.sqrt(L / g);
        const maxAngle = (parseFloat(amplitudeSlider.value) * Math.PI) / 180; // 振幅(radian)
        
        periodDisplay.textContent = period.toFixed(2);
        
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsedTime = (timestamp - startTime) / 1000; // 秒
            const angle = maxAngle * Math.cos(2 * Math.PI * elapsedTime / period);
            
            drawPendulum(angle);
            animationId = requestAnimationFrame(animate);
        }

        animationId = requestAnimationFrame(animate);
    }
    
    startBtn.addEventListener('click', startAnimation);
    
    // 初期描画
    drawPendulum((parseFloat(amplitudeSlider.value) * Math.PI) / 180);
}