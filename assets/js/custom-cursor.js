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

  const isFrame = (target) => target && target.tagName === 'IFRAME';

  document.addEventListener(
    'mousemove',
    (event) => {
      // iframe 으로 들어가면 mouseover 직후 target 이 IFRAME 인 mousemove 가
      // 한 번 더 도착한다. 여기서 다시 보이게 하면 숨김이 즉시 취소된다.
      if (isFrame(event.target)) {
        cursor.classList.remove('is-visible');
        return;
      }

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

  // giscus 댓글이나 유튜브 임베드 같은 iframe 안에서는 마우스 이벤트가
  // 부모 페이지로 오지 않아 상어가 그 자리에 멈춘 것처럼 보인다.
  // 다른 출처의 iframe 내부를 추적할 방법은 없으므로, 들어가는 순간 숨긴다.
  // (iframe 요소에 대한 mouseover 는 부모로 전달되고 document 까지 버블링된다)
  document.addEventListener(
    'mouseover',
    (event) => {
      if (isFrame(event.target)) {
        cursor.classList.remove('is-visible');
      }
    },
    { passive: true }
  );
});
