document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // 터치 기기이거나 움직임 최소화 설정이면 동작시키지 않는다
  const skip =
    window.matchMedia('(hover: none), (pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (skip) return;

  let x = 0;
  let y = 0;
  let ticking = false;

  const render = () => {
    // left/top 대신 transform 을 쓰면 레이아웃 재계산 없이 합성만 일어난다
    cursor.style.transform = `translate3d(${x + 10}px, ${y + 10}px, 0)`;
    ticking = false;
  };

  document.addEventListener(
    'mousemove',
    (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add('is-visible');

      // 프레임당 한 번만 갱신
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    },
    { passive: true }
  );
});
