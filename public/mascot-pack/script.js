/* ============================================================
   Cantinho do AUAU — mascote interativo (vanilla JS)
   - cabeça segue o cursor (±8°, lerp)
   - pupilas seguem o cursor (máx 6px, presas aos olhos)
   - piscar aleatório (3–7s, ~120ms)
   - hover: fica feliz (cabeça inclina, olhos crescem, rabo acelera)
   - rabo acelera por proximidade do cursor
   Tudo via requestAnimationFrame + transform -> 60fps.
   ============================================================ */
(() => {
  const dog     = document.getElementById('dog');
  const head    = document.getElementById('head-container');
  const pupils  = document.getElementById('pupils');
  const lid     = document.getElementById('eye-lid');
  if (!dog || !head || !pupils) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const MAX_HEAD  = 8;     // graus de giro da cabeça
  const MAX_PUPIL = 6;     // px de deslocamento das pupilas (na escala base 360px)
  const TILT      = 5;     // inclinação extra quando feliz
  const EASE      = 0.12;  // suavização do lerp

  // estado: alvo (target) e atual (lerp em direção ao alvo)
  let tHead = 0, cHead = 0;
  let tPx = 0, cPx = 0, tPy = 0, cPy = 0;
  let tTilt = 0, cTilt = 0;
  let happy = false;

  // centro do mascote em coordenadas de viewport (atualizado sob demanda)
  let cx = innerWidth / 2, cy = innerHeight / 2, scale = 1;
  function measure() {
    const r = dog.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    scale = r.width / 360;            // escala atual vs. canvas base
  }
  measure();
  addEventListener('resize', measure, { passive: true });
  addEventListener('scroll', measure, { passive: true });

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // a cabeça observa o cursor em QUALQUER lugar da tela (window mousemove)
  function onMove(clientX, clientY) {
    const nx = clamp((clientX - cx) / (innerWidth * 0.5), -1, 1);
    const ny = clamp((clientY - cy) / (innerHeight * 0.5), -1, 1);
    tHead = nx * MAX_HEAD;
    tPx   = nx * MAX_PUPIL;
    tPy   = ny * MAX_PUPIL;

    // proximidade -> rabo mais rápido (0.22s perto ... 0.6s longe)
    const dist = Math.hypot(clientX - cx, clientY - cy);
    const near = clamp(1 - dist / (innerWidth * 0.55), 0, 1);
    dog.style.setProperty('--wag', (0.6 - near * 0.36).toFixed(3) + 's');
  }
  addEventListener('mousemove', e => onMove(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => {
    if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // hover -> felicidade
  const setHappy = v => { happy = v; dog.classList.toggle('happy', v); tTilt = v ? -TILT : 0; };
  dog.addEventListener('mouseenter', () => setHappy(true));
  dog.addEventListener('mouseleave', () => setHappy(false));
  dog.addEventListener('touchstart', () => setHappy(true),  { passive: true });
  dog.addEventListener('touchend',   () => setHappy(false), { passive: true });

  // loop de animação (lerp suave em direção aos alvos)
  function tick() {
    cHead += (tHead - cHead) * EASE;
    cTilt += (tTilt - cTilt) * EASE;
    cPx   += (tPx   - cPx)   * EASE;
    cPy   += (tPy   - cPy)   * EASE;

    head.style.transform   = `rotate(${(cHead + cTilt).toFixed(3)}deg)`;
    pupils.style.transform = `translate(${(cPx * scale).toFixed(2)}px, ${(cPy * scale).toFixed(2)}px)`;

    requestAnimationFrame(tick);
  }
  if (reduce) {
    head.style.transform = 'rotate(0deg)';        // posição neutra, sem loop
  } else {
    requestAnimationFrame(tick);
  }

  // piscar aleatório a cada 3–7s
  function blink() {
    if (reduce || !lid) return schedule();
    lid.classList.add('blink');
    setTimeout(() => lid.classList.remove('blink'), 120);
    schedule();
  }
  function schedule() {
    setTimeout(blink, 3000 + Math.random() * 4000);
  }
  schedule();
})();
