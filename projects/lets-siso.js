// 데스크톱에서 마우스 휠을 가로 스크롤로 변환
(function(){
    const viewport = document.getElementById('viewport');
    if (!viewport) return;
  
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mqMobile = window.matchMedia('(max-width: 900px)');
  
    function enableHorizontalWheel(){
      // 모바일/터치/세로형 전환에서는 비활성화
      if (isTouch || mqMobile.matches) return;
  
      // 수평 스크롤 휠 변환
      const onWheel = (e) => {
        // 트랙패드 자연 스크롤 대응
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // 이미 가로 스크롤이면 통과
        viewport.scrollLeft += e.deltaY;
        e.preventDefault();
      };
      viewport.addEventListener('wheel', onWheel, { passive: false });
  
      // 접근성: 방향키 ← → 로 패널 이동
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') viewport.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
        if (e.key === 'ArrowLeft')  viewport.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
      });
    }
  
    enableHorizontalWheel();
    mqMobile.addEventListener('change', () => location.reload()); // 레이아웃 전환 시 간단 재적용
  })();
  
