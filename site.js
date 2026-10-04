document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]')
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')]
  const pagination = carousel.querySelector('[data-carousel-pagination]')
  const status = carousel.querySelector('[data-carousel-status]')
  const progress = carousel.querySelector('[data-carousel-progress]')
  const previous = carousel.querySelector('[data-carousel-prev]')
  const next = carousel.querySelector('[data-carousel-next]')
  if (!track || !pagination || slides.length < 2) return

  const rotationDuration = 7000
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let current = 0
  let pointerStart = null
  let rotationTimer = null

  const dots = slides.map((slide, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute(
      'aria-label',
      `Mostrar captura ${index + 1}: ${slide.querySelector('h3')?.textContent ?? ''}`,
    )
    button.addEventListener('click', () => show(index, true))
    pagination.append(button)
    return button
  })

  function restartRotation() {
    window.clearTimeout(rotationTimer)
    progress?.classList.remove('is-running')
    if (reducedMotion.matches || document.hidden) return

    if (progress) {
      void progress.offsetWidth
      progress.classList.add('is-running')
    }
    rotationTimer = window.setTimeout(() => show(current + 1), rotationDuration)
  }

  function show(index, manual = false) {
    current = (index + slides.length) % slides.length
    carousel.style.setProperty('--slide-index', current)
    if (status) status.textContent = `${current + 1} de ${slides.length}`

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current
      slide.setAttribute('aria-hidden', String(!active))
      slide.querySelectorAll('a, button').forEach((control) => {
        if (active) control.removeAttribute('tabindex')
        else control.setAttribute('tabindex', '-1')
      })
    })

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === current) dot.setAttribute('aria-current', 'true')
      else dot.removeAttribute('aria-current')
    })

    if (manual) carousel.focus({ preventScroll: true })
    restartRotation()
  }

  previous?.addEventListener('click', () => show(current - 1, true))
  next?.addEventListener('click', () => show(current + 1, true))
  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    show(current + (event.key === 'ArrowRight' ? 1 : -1), true)
  })

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return
    pointerStart = event.clientX
  })
  track.addEventListener('pointerup', (event) => {
    if (pointerStart === null) return
    const distance = event.clientX - pointerStart
    pointerStart = null
    if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1), true)
  })
  track.addEventListener('pointercancel', () => {
    pointerStart = null
  })

  document.addEventListener('visibilitychange', restartRotation)
  reducedMotion.addEventListener('change', restartRotation)

  show(0)
})
