document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursor');

    document.addEventListener('mousemove', (event) => {
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        // 마우스 위치에 바로 고정 (필요 시 +10 보정 유지)
        cursor.style.left = `${mouseX + 10}px`;
        cursor.style.top = `${mouseY + 10}px`;
    });
});
