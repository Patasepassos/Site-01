'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion'

const BARKS = ['Au Au!', 'Olá!', 'Posso ajudar?', 'Me adote! 🐾', 'Woof!', 'Oi amigo!']

// ─── Position reference ────────────────────────────────────────────────────────
// All values converted to % of the 800×800 dog container.
// Original CSS was in px on an 800×800 canvas (source: mascote_clean_parts brief).

// Within head-container (420 × 380 local space → 52.5% × 47.5% of root):
const H = {
  leftEar:    { left: '-7.14%',  top: '-3.95%',  width: '35.71%' },
  rightEar:   { right: '-3.57%', top: '-2.63%',  width: '34.52%' },
  eyes:       { left: '21.9%',   top: '24.2%',   width: '54.76%' },
  leftPupil:  { left: '28.57%',  top: '36.84%',  width: '9.05%'  },
  rightPupil: { left: '50.48%',  top: '36.84%',  width: '9.05%'  },
  mouth:      { left: '27.38%',  top: '55.26%',  width: '40.48%' },
  tongue:     { left: '36.9%',   top: '64.47%',  width: '17.86%' },
}

export function MascotDog() {
  const wrapRef = useRef<HTMLDivElement>(null)

  // ── Motion values ───────────────────────────────────────────────────────────
  const px = useMotionValue(0)   // normalised cursor X  [-1, 1]
  const py = useMotionValue(0)   // normalised cursor Y  [-1, 1]

  // Head + body — medium spring
  const sx = useSpring(px, { stiffness: 85, damping: 14, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 85, damping: 14, mass: 0.6 })
  // Ears lag behind the head
  const earX = useSpring(px, { stiffness: 48, damping: 13, mass: 1.2 })
  // Pupils — fast, snappy
  const fpx = useSpring(px, { stiffness: 220, damping: 22, mass: 0.2 })
  const fpy = useSpring(py, { stiffness: 220, damping: 22, mass: 0.2 })

  const headRotZ    = useTransform(sx,  [-1, 1], [-8,  8])
  const headLeanY   = useTransform(sy,  [-1, 1], [-6,  6])
  const bodyShiftX  = useTransform(sx,  [-1, 1], [-4,  4])
  const bodyShiftY  = useTransform(sy,  [-1, 1], [-3,  3])
  const leftEarRot  = useTransform(earX, [-1, 1], [ 7, -4])
  const rightEarRot = useTransform(earX, [-1, 1], [ 4, -7])
  const pupilShiftX = useTransform(fpx, [-1, 1], [-7,  7])
  const pupilShiftY = useTransform(fpy, [-1, 1], [-5,  5])

  // ── State ───────────────────────────────────────────────────────────────────
  const [excited,  setExcited]  = useState(false)
  const [hovered,  setHovered]  = useState(false)
  const [bark,     setBark]     = useState<string | null>(null)
  const [barking,  setBarking]  = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [curious,  setCurious]  = useState(false)

  const idleTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auto-blink every 2.5–5 s ───────────────────────────────────────────────
  const scheduleBlink = useCallback(() => {
    blinkTimer.current = setTimeout(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 190)
      scheduleBlink()
    }, 2500 + Math.random() * 2500)
  }, [])

  useEffect(() => {
    scheduleBlink()
    return () => clearTimeout(blinkTimer.current!)
  }, [scheduleBlink])

  // ── Cursor tracking ─────────────────────────────────────────────────────────
  const onMove = useCallback((e: MouseEvent) => {
    const el = wrapRef.current
    if (!el) return
    const r  = el.getBoundingClientRect()
    const cx = r.left + r.width  * 0.5
    const cy = r.top  + r.height * 0.38   // roughly the head centre
    px.set(Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth  / 2))))
    py.set(Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))))

    const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
    setExcited(dist < r.width * 1.1)
    if (curious) setCurious(false)

    clearTimeout(idleTimer.current!)
    idleTimer.current = setTimeout(() => {
      px.set(0); py.set(0)
      setExcited(false)
      // curiosity: dog tilts head after 2 s of no mouse movement
      setCurious(true)
      setTimeout(() => setCurious(false), 2200)
    }, 2000)
  }, [px, py, curious])

  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      clearTimeout(idleTimer.current!)
    }
  }, [onMove])

  // ── Bark ────────────────────────────────────────────────────────────────────
  const doBark = useCallback(() => {
    setBark(BARKS[Math.floor(Math.random() * BARKS.length)])
    setBarking(true)
    setExcited(true)
    setTimeout(() => setBark(null),     1600)
    setTimeout(() => setBarking(false),  430)
  }, [])

  const tailDur = hovered ? 0.18 : excited ? 0.25 : 0.52

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      ref={wrapRef}
      onMouseEnter={() => { setHovered(true);  setExcited(true)  }}
      onMouseLeave={() => { setHovered(false); setExcited(false) }}
      onClick={doBark}
      initial={{ opacity: 0, scale: 0.88, y: 32 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="relative select-none"
      style={{ width: 'min(420px, 88vw)', aspectRatio: '1 / 1', cursor: 'pointer' }}
    >
      {/* ── Background blob ── */}
      <div aria-hidden className="absolute inset-0 -z-20" style={{
        background: 'radial-gradient(62% 56% at 50% 46%, #BBD4FB 0%, #CFE0FB 42%, rgba(207,224,251,0) 68%)',
        borderRadius: '46% 54% 50% 50% / 52% 48% 52% 48%',
      }} />

      {/* ── Hover glow ── */}
      <motion.div aria-hidden
        className="absolute -z-10 rounded-full blur-3xl"
        style={{ left: '15%', right: '15%', top: '10%', bottom: '10%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.24), rgba(59,130,246,0) 70%)' }}
        animate={{ opacity: hovered ? 0.9 : 0.38, scale: hovered ? 1.12 : 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* ── Floating (everything moves up/down together) ── */}
      <motion.div className="absolute inset-0"
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* ── Parallax on body ── */}
        <motion.div className="absolute inset-0" style={{ x: bodyShiftX, y: bodyShiftY }}>

          {/* ── TAIL (z-index 0, behind body) ── */}
          <motion.img
            src="/parts/tail.png" alt="" draggable={false}
            className="absolute"
            style={{ left: '65%', top: '45%', width: '15%', transformOrigin: '10% 50%' }}
            animate={{ rotate: excited ? [-14, 20, -14] : [-9, 13, -9] }}
            transition={{ duration: tailDur, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── BODY — breathing scale ── */}
          <motion.img
            src="/parts/body-no-tail.png"
            alt="Mascote da Patas & Passos" draggable={false}
            className="absolute"
            style={{ left: '38.75%', top: '36.25%', width: '35%', transformOrigin: '50% 40%' }}
            animate={{ scaleY: [1, 1.018, 1], scaleX: [1, 0.994, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── HEAD CONTAINER (z-index 3) ── */}
          {/* Outer: curiosity tilt */}
          <motion.div
            className="absolute"
            style={{
              left: '16.25%', top: '22.5%', width: '52.5%', height: '47.5%',
              transformOrigin: '55% 65%',
            }}
            animate={curious ? { rotate: 14 } : { rotate: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Inner: spring cursor tracking */}
            <motion.div
              className="absolute inset-0"
              style={{ rotate: headRotZ, y: headLeanY, transformOrigin: '55% 65%' }}
            >
              {/* LEFT EAR — behind head */}
              <motion.img
                src="/parts/left-ear.png" alt="" draggable={false}
                className="absolute"
                style={{ ...H.leftEar, transformOrigin: '80% 90%', rotate: leftEarRot }}
              />

              {/* RIGHT EAR — behind head */}
              <motion.img
                src="/parts/right-ear.png" alt="" draggable={false}
                className="absolute"
                style={{ ...H.rightEar, transformOrigin: '20% 90%', rotate: rightEarRot }}
              />

              {/* HEAD — covers base of ears */}
              <img
                src="/parts/head.png" alt="" draggable={false}
                className="absolute top-0 left-0 w-full"
              />

              {/* EYES — blink via scaleY */}
              <motion.img
                src="/parts/eyes.png" alt="" draggable={false}
                className="absolute"
                style={{ ...H.eyes, transformOrigin: '50% 50%' }}
                animate={{ scaleY: blinking ? 0.05 : 1 }}
                transition={{ duration: blinking ? 0.09 : 0.13, ease: 'easeInOut' }}
              />

              {/* PUPILS — fast tracking, hide on blink */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ x: pupilShiftX, y: pupilShiftY }}
              >
                <img
                  src="/parts/left-pupil.png" alt="" draggable={false}
                  className="absolute"
                  style={{ ...H.leftPupil, opacity: blinking ? 0 : 1, transition: 'opacity 0.06s' }}
                />
                <img
                  src="/parts/right-pupil.png" alt="" draggable={false}
                  className="absolute"
                  style={{ ...H.rightPupil, opacity: blinking ? 0 : 1, transition: 'opacity 0.06s' }}
                />
              </motion.div>

              {/* MOUTH — stretches on bark/hover */}
              <motion.img
                src="/parts/mouth.png" alt="" draggable={false}
                className="absolute"
                style={{ ...H.mouth, transformOrigin: '50% 20%' }}
                animate={
                  barking  ? { scaleY: [1, 1.22, 1], y: [0, 3, 0] } :
                  hovered  ? { scaleY: 1.07 } :
                             { scaleY: 1, y: 0 }
                }
                transition={{ duration: barking ? 0.35 : 0.28, ease: 'easeOut' }}
              />

              {/* TONGUE — pops on bark / hover */}
              <motion.img
                src="/parts/tongue.png" alt="" draggable={false}
                className="absolute"
                style={{ ...H.tongue, transformOrigin: '50% 0%' }}
                animate={
                  barking ? { scaleY: [0, 1.35, 1.0], opacity: [0, 1, 1] } :
                  hovered ? { scaleY: 1, opacity: 1 } :
                            { scaleY: 0, opacity: 0 }
                }
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </motion.div>
          </motion.div>

        </motion.div>
      </motion.div>

      {/* ── Bark speech bubble ── */}
      <AnimatePresence>
        {bark && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{    opacity: 0, scale: 0.6, y: 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="absolute right-[4%] top-[14%] z-20 rounded-2xl border-2 border-blue-400 bg-white px-4 py-2 shadow-xl"
          >
            <span className="text-base font-extrabold text-blue-600">{bark}</span>
            <span className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-b-2 border-r-2 border-blue-400 bg-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
