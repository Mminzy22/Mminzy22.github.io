// 커스텀 애니메이션 및 인터랙션 효과

document.addEventListener("DOMContentLoaded", () => {
  // 스크롤 애니메이션 관찰자
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // 애니메이션 대상 요소들 관찰
  const animateElements = document.querySelectorAll(".card, .post-preview, h1, h2, h3")
  animateElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out"
    observer.observe(el)
  })

  // 부드러운 스크롤
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // 카드 호버 효과 개선
  const cards = document.querySelectorAll(".card, .post-preview")
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })

  // 버튼 리플 효과
  const buttons = document.querySelectorAll(".btn")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.width = ripple.style.height = size + "px"
      ripple.style.left = x + "px"
      ripple.style.top = y + "px"
      ripple.classList.add("ripple")

      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })

  // 타이핑 효과 (제목용)
  function typeWriter(element, text, speed = 100) {
    let i = 0
    element.innerHTML = ""

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i)
        i++
        setTimeout(type, speed)
      }
    }
    type()
  }

  // 메인 제목에 타이핑 효과 적용
  const mainTitle = document.querySelector("h1.dynamic-title")
  if (mainTitle) {
    const originalText = mainTitle.textContent
    typeWriter(mainTitle, originalText, 80)
  }

  // 스크롤 진행률 표시
  const scrollProgress = document.createElement("div")
  scrollProgress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
        transition: width 0.1s ease-out;
    `
  document.body.appendChild(scrollProgress)

  window.addEventListener("scroll", () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    scrollProgress.style.width = scrolled + "%"
  })

  // 이미지 레이지 로딩 개선
  const images = document.querySelectorAll('img[loading="lazy"]')
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.style.opacity = "0"
        img.style.transition = "opacity 0.5s ease-in-out"

        img.onload = () => {
          img.style.opacity = "1"
        }

        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))

  // 다크모드 전환 애니메이션
  const modeToggle = document.getElementById("mode-toggle")
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      document.body.style.transition = "background-color 0.3s ease, color 0.3s ease"

      setTimeout(() => {
        document.body.style.transition = ""
      }, 300)
    })
  }

  // 검색 박스 포커스 효과
  const searchInput = document.getElementById("search-input")
  if (searchInput) {
    searchInput.addEventListener("focus", function () {
      this.parentElement.style.transform = "scale(1.02)"
    })

    searchInput.addEventListener("blur", function () {
      this.parentElement.style.transform = "scale(1)"
    })
  }

  // 사이드바 네비게이션 애니메이션
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`
    item.classList.add("nav-item-animate")
  })

  // 코드 블록 복사 버튼 개선
  const copyButtons = document.querySelectorAll(".code-header button")
  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })

  // 페이지 로드 완료 후 애니메이션
  window.addEventListener("load", () => {
    document.body.classList.add("loaded")

    // 로딩 스피너가 있다면 제거
    const loader = document.querySelector(".loader")
    if (loader) {
      loader.style.opacity = "0"
      setTimeout(() => loader.remove(), 500)
    }
  })

  // 터치 디바이스 최적화
  if ("ontouchstart" in window) {
    document.body.classList.add("touch-device")

    // 터치 디바이스에서 호버 효과 조정
    cards.forEach((card) => {
      card.addEventListener("touchstart", function () {
        this.classList.add("touch-active")
      })

      card.addEventListener("touchend", function () {
        setTimeout(() => {
          this.classList.remove("touch-active")
        }, 300)
      })
    })
  }
})

// CSS 애니메이션 클래스 추가
const style = document.createElement("style")
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-item-animate {
        animation: slideInLeft 0.5s ease-out forwards;
        opacity: 0;
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .touch-device .card:hover {
        transform: none;
    }
    
    .touch-active {
        transform: translateY(-4px) scale(1.01) !important;
    }
    
    body.loaded {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`
document.head.appendChild(style)
