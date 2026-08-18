/* ============================================================
   AUAU — editor visual de posições
   - arrastar / selecionar / redimensionar / ordem de camada
   - mostrar/ocultar cada PNG (checkbox)
   - "Corpo (com rabo)" e "Corpo (sem rabo)" como camadas alternáveis
   - "Simular movimento": anima o mascote com as posições atuais
   Estado por peça: {x,y,w,z,on} em px na base 360x380 (origem = canto
   superior esquerdo). Resultado em window.__layout + localStorage.
   ============================================================ */
(() => {
  const BASE_W = 360, BASE_H = 380;
  const MAX_HEAD = 8, MAX_PUPIL = 6, EASE = 0.12;
  const scale = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1.6;

  // key, label, srcs, x, y, w, natW, natH, z, on
  // >>> Montagem final do Henry, gravada no código (ver layout.json). NÃO alterar
  //     posições/escala sem pedir. body e mouth usam os recortes à mão dele.
  const DEFAULTS = [
    ['tail',        'Rabo',            ['parts/tail_edit.png'],             208, 232,  53,  76, 104, 1, true],
    ['body',        'Corpo (recorte)', ['parts/body_edit.png'],              70, 175, 175, 175, 150, 2, true],
    ['body_notail', 'Corpo (sem rabo)',['parts/body_notail.png'],            94, 150, 175, 175, 150, 2, false],
    ['head',        'Cabeça',          ['parts/02_head.png'],                43,  49, 185, 185, 149, 3, true],
    ['ears',        'Orelhas',         ['parts/04_ears.png'],                70,   8, 174, 174, 100, 4, false],
    ['eyes',        'Olhos',           ['parts/eyes_base.png','parts/eyes_pupils.png'], 87, 94, 96, 123, 54, 5, true],
    ['mouth',       'Focinho/boca',    ['parts/mouth_edit.png'],             98, 139,  75, 130,  84, 6, true],
    ['tongue',      'Língua',          ['parts/06_tongue.png'],             123, 171,  26,  60,  47, 7, true],
  ];
  const HEAD_GROUP = ['ears', 'head', 'eyes', 'mouth', 'tongue'];   // giram com a cabeça
  const ANIM   = { tail:'anim-tail', body:'anim-body', body_notail:'anim-body', ears:'anim-ears', tongue:'anim-tongue' };
  const ORIGIN = { tail:'26% 82%', body:'50% 100%', body_notail:'50% 100%', ears:'50% 92%', tongue:'50% 0%' };

  const stage   = document.getElementById('stage');
  const listEl  = document.getElementById('list');
  const jsonEl  = document.getElementById('json');
  const savedEl = document.getElementById('saved');
  const simBtn  = document.getElementById('sim');
  const simHint = document.getElementById('simhint');

  let pieces = [];
  let selected = 'eyes';
  let mode = 'edit';
  const get = k => pieces.find(p => p.key === k);
  const hpx = p => p.w * p.natH / p.natW;
  const visible = () => pieces.filter(p => p.on);
  const srcFor = p => p.editedSrc || p.srcs[0];   // usa o recorte do usuário, se houver

  function load() {
    let saved = null, edits = {};
    try { saved = JSON.parse(localStorage.getItem('auau_layout') || 'null'); } catch (_) {}
    try { edits = JSON.parse(localStorage.getItem('auau_edits') || '{}'); } catch (_) {}
    pieces = DEFAULTS.map(([key, label, srcs, x, y, w, natW, natH, z, on]) => {
      const s = saved && saved[key];
      const p = { key, label, srcs, natW, natH,
                  x: s ? s.x : x, y: s ? s.y : y, w: s ? s.w : w,
                  z: s ? s.z : z, on: s && 'on' in s ? !!s.on : on };
      if (edits[key]) p.editedSrc = edits[key];
      return p;
    });
  }

  /* ===================== MODO EDIÇÃO ===================== */
  function makeEl(p) {
    let el;
    if (p.srcs.length > 1) {
      el = document.createElement('div'); el.className = 'piece compound';
      p.srcs.forEach(src => { const i = new Image(); i.src = src; el.appendChild(i); });
    } else {
      el = new Image(); el.className = 'piece'; el.src = srcFor(p);
    }
    el.dataset.key = p.key; el.draggable = false;
    return el;
  }

  function buildEdit() {
    stage.querySelectorAll('.piece,.tag,#sim-head').forEach(n => n.remove());
    for (const p of pieces) {
      if (!p.on) { p.el = null; continue; }
      p.el = makeEl(p); stage.appendChild(p.el);
    }
    const tag = document.createElement('div'); tag.className = 'tag'; tag.id = 'tag';
    stage.appendChild(tag);
    layout(); buildList();
  }

  function layout() {
    const S = scale();
    for (const p of pieces) {
      const el = p.el; if (!el) continue;
      el.style.left = (p.x * S) + 'px';
      el.style.top = (p.y * S) + 'px';
      el.style.width = (p.w * S) + 'px';
      if (el.tagName === 'DIV') el.style.height = (hpx(p) * S) + 'px';
      el.style.zIndex = p.z;
      el.classList.toggle('sel', p.key === selected);
    }
    const sp = get(selected), tag = document.getElementById('tag');
    if (sp && sp.el && tag) {
      tag.hidden = false;
      tag.textContent = `${sp.label}  x:${Math.round(sp.x)} y:${Math.round(sp.y)} w:${Math.round(sp.w)}`;
      tag.style.left = (sp.x * S) + 'px'; tag.style.top = (sp.y * S - 4) + 'px';
    } else if (tag) tag.hidden = true;
    report();
  }

  function buildList() {
    listEl.innerHTML = '';
    [...pieces].sort((a, b) => b.z - a.z).forEach(p => {       // frente -> trás
      const li = document.createElement('li');
      li.dataset.key = p.key;
      li.className = (p.key === selected ? 'active ' : '') + (p.on ? '' : 'off');
      li.innerHTML =
        `<span class="nm">
           <input type="checkbox" class="vis" ${p.on ? 'checked' : ''} title="Mostrar/ocultar">
           <span class="lb">${p.label}</span>
         </span>
         <span class="co" data-co="${p.key}">${Math.round(p.x)}, ${Math.round(p.y)} · ${Math.round(p.w)}px</span>`;
      li.querySelector('.vis').addEventListener('change', e => {
        e.stopPropagation(); p.on = e.target.checked;
        if (p.on) selected = p.key;
        if (mode === 'sim') { exitSim(); } else { buildEdit(); }
        save();
      });
      li.addEventListener('pointerdown', e => {
        if (e.target.classList.contains('vis')) return;
        e.stopPropagation(); if (mode === 'edit') select(p.key);
      });
      listEl.appendChild(li);
    });
  }
  function refreshList() {
    pieces.forEach(p => {
      const co = listEl.querySelector(`[data-co="${p.key}"]`);
      if (co) co.textContent = `${Math.round(p.x)}, ${Math.round(p.y)} · ${Math.round(p.w)}px`;
    });
    listEl.querySelectorAll('li').forEach(li =>
      li.classList.toggle('active', li.dataset.key === selected));
  }
  function select(key) { selected = key; layout(); refreshList(); }

  function moveZ(dir) {
    const sorted = visible().sort((a, b) => a.z - b.z);
    const i = sorted.findIndex(p => p.key === selected), j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const t = sorted[i].z; sorted[i].z = sorted[j].z; sorted[j].z = t;
    layout(); buildList(); save();
  }

  /* ---------- export ---------- */
  function report() {
    const out = {};
    for (const p of pieces) out[p.key] = { x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.w), z: p.z, on: p.on };
    const active = visible().sort((a, b) => a.z - b.z).map(p => p.key);
    const payload = { canvas: { w: BASE_W, h: BASE_H }, origin: 'top-left', active, pieces: out };
    jsonEl.value = JSON.stringify(payload, null, 2);
    window.__layout = payload;
    try { localStorage.setItem('auau_layout', JSON.stringify(out)); } catch (_) {}
  }
  function save() {
    report();
    savedEl.textContent = '✓ salvo'; savedEl.classList.add('show');
    clearTimeout(save._t); save._t = setTimeout(() => savedEl.classList.remove('show'), 1200);
  }

  /* ---------- arrasto ---------- */
  let drag = null;
  function topmostAt(x, y) {
    for (const el of document.elementsFromPoint(x, y)) {
      const pe = el.closest && el.closest('.piece');
      if (pe && stage.contains(pe)) return pe.dataset.key;
    }
    return null;
  }
  stage.addEventListener('pointerdown', e => {
    if (mode !== 'edit') return;
    const hit = topmostAt(e.clientX, e.clientY);
    if (hit) selected = hit;
    const p = get(selected); if (!p || !p.el) return;
    drag = { sx: e.clientX, sy: e.clientY, px: p.x, py: p.y };
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    layout(); refreshList();
  });
  stage.addEventListener('pointermove', e => {
    if (!drag || mode !== 'edit') return;
    const S = scale(), p = get(selected);
    p.x = drag.px + (e.clientX - drag.sx) / S;
    p.y = drag.py + (e.clientY - drag.sy) / S;
    layout();
  });
  const endDrag = () => { if (drag) { drag = null; refreshList(); save(); } };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('wheel', e => {
    if (mode !== 'edit') return;
    e.preventDefault();
    const p = get(selected); if (!p || !p.el) return;
    const cx = p.x + p.w / 2, cy = p.y + hpx(p) / 2;
    p.w = Math.max(16, p.w * (e.deltaY < 0 ? 1.03 : 0.97));
    p.x = cx - p.w / 2; p.y = cy - hpx(p) / 2;
    layout(); refreshList(); save();
  }, { passive: false });

  addEventListener('keydown', e => {
    if (mode === 'cut') {
      if (e.key === 'Escape') exitCut(false);
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undoCut(); }
      return;
    }
    if (mode !== 'edit') { if (e.key === 'Escape') exitSim(); return; }
    const p = get(selected); if (!p) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft') p.x -= step;
    else if (e.key === 'ArrowRight') p.x += step;
    else if (e.key === 'ArrowUp') p.y -= step;
    else if (e.key === 'ArrowDown') p.y += step;
    else if (e.key === ']') return moveZ(1);
    else if (e.key === '[') return moveZ(-1);
    else return;
    e.preventDefault(); layout(); refreshList(); save();
  });

  /* ===================== MODO SIMULAÇÃO ===================== */
  const sim = { raf: 0, blink: 0, onMove: null, head: 0, px: 0, py: 0, tHead: 0, tpx: 0, tpy: 0 };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  function img(src, cls) { const i = new Image(); i.src = src; i.className = 'piece' + (cls ? ' ' + cls : ''); i.draggable = false; return i; }
  function place(el, p) {
    const S = scale();
    el.style.position = 'absolute';
    el.style.left = (p.x * S) + 'px'; el.style.top = (p.y * S) + 'px';
    el.style.width = (p.w * S) + 'px'; el.style.height = 'auto';
  }

  function buildSim() {
    stage.querySelectorAll('.piece,.tag').forEach(n => n.remove());
    stage.classList.add('sim');
    sim.eyesEl = sim.pupEl = null;

    const head = document.createElement('div'); head.id = 'sim-head';
    const hp = get('head').on ? get('head') : (get('body_notail').on ? get('body_notail') : get('body'));
    const Nx = hp.x + hp.w / 2, Ny = hp.y + hpx(hp) * 0.95;
    head.style.transformOrigin = `${(Nx / BASE_W * 100).toFixed(2)}% ${(Ny / BASE_H * 100).toFixed(2)}%`;
    // o grupo da cabeça precisa de z-index, senão fica ABAIXO do corpo (que é
    // posicionado com z-index positivo) e o corpo cobre a cabeça na simulação.
    const maxFree = Math.max(0, ...visible().filter(p => !HEAD_GROUP.includes(p.key)).map(p => p.z));
    head.style.zIndex = maxFree + 1;

    visible().sort((a, b) => a.z - b.z).forEach(p => {
      let el;
      if (p.key === 'eyes') {
        el = document.createElement('div'); el.id = 'sim-eyes';
        place(el, p); el.style.height = (hpx(p) * scale()) + 'px';
        el.style.transformOrigin = '50% 55%';
        el.appendChild(img(p.srcs[0]));
        const pup = img(p.srcs[1]); pup.id = 'sim-pupils'; el.appendChild(pup);
        sim.eyesEl = el; sim.pupEl = pup;
      } else {
        el = img(srcFor(p), ANIM[p.key]); place(el, p);
        if (ORIGIN[p.key]) el.style.transformOrigin = ORIGIN[p.key];
      }
      el.style.zIndex = p.z;
      (HEAD_GROUP.includes(p.key) ? head : stage).appendChild(el);
    });
    stage.appendChild(head);
    sim.headEl = head;
  }

  function enterSim() {
    mode = 'sim';
    simBtn.textContent = '⏹ Parar';
    simBtn.classList.remove('primary'); simBtn.classList.add('danger');
    simHint.hidden = false;
    buildSim();

    sim.onMove = e => {
      const t = (e.touches && e.touches[0]) || e;
      const nx = clamp((t.clientX - innerWidth / 2) / (innerWidth * 0.5), -1, 1);
      const ny = clamp((t.clientY - innerHeight / 2) / (innerHeight * 0.5), -1, 1);
      sim.tHead = nx * MAX_HEAD; sim.tpx = nx * MAX_PUPIL; sim.tpy = ny * MAX_PUPIL;
    };
    addEventListener('mousemove', sim.onMove, { passive: true });
    addEventListener('touchmove', sim.onMove, { passive: true });
    sim.enter = () => stage.style.setProperty('--wag', '0.22s');
    sim.leave = () => stage.style.setProperty('--wag', '0.5s');
    stage.addEventListener('pointerenter', sim.enter);
    stage.addEventListener('pointerleave', sim.leave);

    const blink = () => {
      sim.eyesEl && sim.eyesEl.classList.add('blink');
      setTimeout(() => sim.eyesEl && sim.eyesEl.classList.remove('blink'), 120);
      sim.blink = setTimeout(blink, 3000 + Math.random() * 4000);
    };
    sim.blink = setTimeout(blink, 2000 + Math.random() * 3000);

    const S = scale();
    const tick = () => {
      sim.head += (sim.tHead - sim.head) * EASE;
      sim.px += (sim.tpx - sim.px) * EASE;
      sim.py += (sim.tpy - sim.py) * EASE;
      if (sim.headEl) sim.headEl.style.transform = `rotate(${sim.head.toFixed(3)}deg)`;
      if (sim.pupEl) sim.pupEl.style.transform = `translate(${(sim.px * S).toFixed(2)}px, ${(sim.py * S).toFixed(2)}px)`;
      sim.raf = requestAnimationFrame(tick);
    };
    sim.raf = requestAnimationFrame(tick);
  }

  function exitSim() {
    if (mode !== 'sim') return;
    mode = 'edit';
    cancelAnimationFrame(sim.raf); clearTimeout(sim.blink);
    removeEventListener('mousemove', sim.onMove);
    removeEventListener('touchmove', sim.onMove);
    stage.removeEventListener('pointerenter', sim.enter);
    stage.removeEventListener('pointerleave', sim.leave);
    stage.classList.remove('sim'); stage.style.removeProperty('--wag');
    Object.assign(sim, { head: 0, px: 0, py: 0, tHead: 0, tpx: 0, tpy: 0 });
    simBtn.textContent = '▶ Simular movimento';
    simBtn.classList.add('primary'); simBtn.classList.remove('danger');
    simHint.hidden = true;
    buildEdit();
  }

  /* ===================== MODO RECORTE (à mão livre) ===================== */
  const panel   = document.querySelector('.panel');
  const cuthint = document.getElementById('cuthint');
  const cut = { on: false, p: null, cv: null, ctx: null, orig: null, W: 0, H: 0,
                tool: 'lasso', brush: 22, drawing: false, last: null, pts: [], snap: null, hist: [] };

  function flashHint(msg) {
    savedEl.textContent = msg; savedEl.classList.add('show');
    clearTimeout(flashHint._t); flashHint._t = setTimeout(() => savedEl.classList.remove('show'), 2000);
  }
  function placeCutCanvas() {
    const S = scale(), p = cut.p, cv = cut.cv; if (!cv) return;
    cv.style.left = (p.x * S) + 'px'; cv.style.top = (p.y * S) + 'px';
    cv.style.width = (p.w * S) + 'px'; cv.style.height = (hpx(p) * S) + 'px';
  }
  const brushNative = () => Math.max(1, cut.brush * cut.W / (cut.p.w * scale()));
  function ptOf(e) {
    const r = cut.cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * cut.W, y: (e.clientY - r.top) / r.height * cut.H };
  }
  function pushHist() {
    if (cut.hist.length > 20) cut.hist.shift();
    cut.hist.push(cut.ctx.getImageData(0, 0, cut.W, cut.H));
  }

  function enterCut() {
    if (mode !== 'edit') return;
    const p = get(selected);
    if (!p || !p.on || !p.el) return flashHint('Selecione uma peça visível para recortar.');
    if (p.srcs.length > 1) return flashHint('“Olhos” é camada dupla — não dá pra recortar aqui.');
    mode = 'cut'; cut.on = true; cut.p = p; cut.hist = [];
    panel.classList.add('cutmode'); stage.classList.add('cutting');
    p.el.style.visibility = 'hidden';

    const im = new Image();
    im.onload = () => {
      cut.W = im.naturalWidth; cut.H = im.naturalHeight;
      const cv = document.createElement('canvas'); cv.id = 'cutcanvas';
      cv.width = cut.W; cv.height = cut.H;
      const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
      cut.cv = cv; cut.ctx = ctx;
      cut.orig = document.createElement('canvas'); cut.orig.width = cut.W; cut.orig.height = cut.H;
      cut.orig.getContext('2d').drawImage(cv, 0, 0);
      placeCutCanvas(); stage.appendChild(cv); bindCut(cv); setTool(cut.tool);
    };
    im.src = srcFor(p);
  }

  function bindCut(cv) {
    cv.addEventListener('pointerdown', e => {
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      cut.drawing = true; pushHist();
      const pt = ptOf(e);
      if (cut.tool === 'lasso') { cut.pts = [pt]; cut.snap = cut.ctx.getImageData(0, 0, cut.W, cut.H); }
      else { cut.last = pt; stroke(pt, pt); }
    });
    cv.addEventListener('pointermove', e => {
      if (!cut.drawing) return;
      const pt = ptOf(e);
      if (cut.tool === 'lasso') { cut.pts.push(pt); previewLasso(); }
      else { stroke(cut.last, pt); cut.last = pt; }
    });
    const up = () => { if (!cut.drawing) return; cut.drawing = false; if (cut.tool === 'lasso') applyLasso(); };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
  }

  function stroke(a, b) {
    const ctx = cut.ctx, r = brushNative();
    if (cut.tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = '#000'; ctx.lineWidth = r; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else { // restaurar: re-pinta o original sob o pincel
      const steps = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y) / (r / 3));
      for (let i = 0; i <= steps; i++) {
        const x = a.x + (b.x - a.x) * i / steps, y = a.y + (b.y - a.y) * i / steps;
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r / 2, 0, 7); ctx.clip();
        ctx.drawImage(cut.orig, 0, 0); ctx.restore();
      }
    }
  }

  function tracePath(ctx) {
    ctx.beginPath();
    cut.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  }
  function previewLasso() {
    const ctx = cut.ctx; ctx.putImageData(cut.snap, 0, 0);
    ctx.save(); ctx.strokeStyle = 'rgba(59,111,214,.95)';
    ctx.lineWidth = Math.max(1, cut.W / 120); ctx.setLineDash([6, 5]);
    tracePath(ctx); ctx.stroke(); ctx.restore();
  }
  function applyLasso() {
    const ctx = cut.ctx;
    ctx.putImageData(cut.snap, 0, 0);                 // remove a linha de preview
    if (cut.pts.length < 3) return;
    ctx.save(); ctx.globalCompositeOperation = 'destination-in';
    tracePath(ctx); ctx.closePath(); ctx.fill(); ctx.restore();   // mantém só o interior
  }

  function setTool(t) {
    cut.tool = t;
    document.querySelectorAll('.cuttool').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
    cuthint.textContent = t === 'lasso'
      ? 'Laço: desenhe um contorno fechado — fica só o que estiver DENTRO do traço.'
      : t === 'erase' ? 'Borracha: arraste para apagar (recortar) o que passar por baixo.'
      : 'Restaurar: arraste para trazer de volta o que você apagou.';
  }
  function undoCut() { if (cut.hist.length) cut.ctx.putImageData(cut.hist.pop(), 0, 0); }
  function loadOrig() {                                // volta ao PNG original do arquivo
    const im = new Image();
    im.onload = () => {
      pushHist();
      cut.ctx.clearRect(0, 0, cut.W, cut.H); cut.ctx.drawImage(im, 0, 0);
      const o = cut.orig.getContext('2d'); o.clearRect(0, 0, cut.W, cut.H); o.drawImage(im, 0, 0);
    };
    im.src = cut.p.srcs[0];
  }
  function downloadCut() {
    const a = document.createElement('a');
    a.href = cut.cv.toDataURL('image/png'); a.download = cut.p.key + '_recorte.png'; a.click();
  }
  function persistEdits() {
    const m = {}; pieces.forEach(p => { if (p.editedSrc) m[p.key] = p.editedSrc; });
    try { localStorage.setItem('auau_edits', JSON.stringify(m)); } catch (_) {}
  }
  function exitCut(saveIt) {
    if (!cut.on) return;
    if (saveIt && cut.cv) { cut.p.editedSrc = cut.cv.toDataURL('image/png'); persistEdits(); }
    cut.cv && cut.cv.remove();
    stage.classList.remove('cutting'); panel.classList.remove('cutmode');
    if (cut.p && cut.p.el) cut.p.el.style.visibility = '';
    Object.assign(cut, { on: false, cv: null, ctx: null, orig: null, snap: null, hist: [] });
    mode = 'edit'; buildEdit();
    if (saveIt) flashHint('✓ recorte aplicado');
  }

  /* ===================== BOTÕES ===================== */
  document.getElementById('cut').addEventListener('click', enterCut);
  document.querySelectorAll('.cuttool').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
  const brushInput = document.getElementById('brush');
  brushInput.addEventListener('input', () => {
    cut.brush = +brushInput.value; document.getElementById('brushv').textContent = brushInput.value;
  });
  document.getElementById('undo').addEventListener('click', undoCut);
  document.getElementById('cutorig').addEventListener('click', loadOrig);
  document.getElementById('dlpng').addEventListener('click', downloadCut);
  document.getElementById('cutdone').addEventListener('click', () => exitCut(true));
  document.getElementById('cutcancel').addEventListener('click', () => exitCut(false));

  simBtn.addEventListener('click', () => (mode === 'sim' ? exitSim() : enterSim()));
  document.getElementById('front').addEventListener('click', () => mode === 'edit' && moveZ(1));
  document.getElementById('back').addEventListener('click', () => mode === 'edit' && moveZ(-1));
  document.getElementById('reset').addEventListener('click', () => {
    if (mode === 'sim') exitSim();
    localStorage.removeItem('auau_layout'); load(); buildEdit();
  });
  document.getElementById('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(jsonEl.value); }
    catch (_) { jsonEl.select(); document.execCommand('copy'); }
    savedEl.textContent = '✓ copiado'; savedEl.classList.add('show');
    setTimeout(() => savedEl.classList.remove('show'), 1400);
  });
  // envia layout + recortes (PNGs) direto pro projeto (precisa do save_receiver ligado)
  document.getElementById('export').addEventListener('click', async () => {
    const payload = JSON.stringify({
      layout: window.__layout,
      edits: JSON.parse(localStorage.getItem('auau_edits') || '{}'),
    });
    flashHint('enviando…');
    try {
      const r = await fetch('http://127.0.0.1:8123/export',
        { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: payload });
      flashHint(r.ok ? '✓ enviado ao projeto!' : 'receiver respondeu ' + r.status);
    } catch (_) {
      flashHint('receiver offline — peça pro Claude ligar o save_receiver');
    }
  });
  addEventListener('resize', () => {
    if (mode === 'edit') layout();
    else if (mode === 'cut' && cut.cv) placeCutCanvas();
  });

  load(); buildEdit(); report();
})();
