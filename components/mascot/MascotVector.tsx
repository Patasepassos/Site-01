'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  Body,
  Collar,
  DOG_VIEWBOX,
  DogDefs,
  Eyebrows,
  Eyes,
  GroundShadow,
  HeadFace,
  LeftEar,
  Mouth,
  Nose,
  Pupils,
  RightEar,
  Tag,
  Tail,
  Tongue,
} from './dogArt'

const BARKS = ['Au Au!', 'Olá!', 'Posso ajudar?']

/**
 * Fully-vector, layer-rigged mascot. Every part is an SVG <g> animated with
 * Framer Motion: head follows the cursor (spring), pupils/ears lag, tail wags
 * (faster on proximity/hover), idle breathing + floating + random blink,
 * curiosity head-tilt when idle, hover excitement, click → bark bubble.
 */
export function MascotVector() {
  const wrapRef = useRef<HTMLDivElement>(null)

  // normalized cursor relative to the dog, range ~[-1, 1]
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 90, damping: 14, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 90, damping: 14, mass: 0.6 })
  const lag = useSpring(px, { stiffness: 50, damping: 16, mass: 1 })

  // head follow (±10° / ±7°) + small shift
  const headRotate = useTransform(sx, [-1, 1], [-10, 10])
  const headY = useTransform(sy, [-1, 1], [-6, 8])
  const headX = useTransform(sx, [-1, 1], [-8, 8])
  // pupils & ears
  const pupilX = useTransform(sx, [-1, 1], [-6, 6])
  const pupilY = useTransform(sy, [-1, 1], [-4, 5])
  const earL = useTransform(lag, [-1, 1], [4, -8])
  const earR = useTransform(lag, [-1, 1], [8, -4])
  // whole-body parallax
  const bodyX = useTransform(sx, [-1, 1], [-7, 7])
  const bodyY = useTransform(sy, [-1, 1], [-4, 4])
  const groupTilt = useTransform(sx, [-1, 1], [-1.5, 1.5])

  const [hovered, setHovered] = useState(false)
  const [excited, setExcited] = useState(false)
  const [blink, setBlink] = useState(false)
  const [bark, setBark] = useState<string | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMove = useCallback(
    (e: MouseEvent) => {
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.4
      px.set(Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))))
      py.set(Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))))

      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      setExcited(dist < r.width * 1.2)

      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        setExcited(false)
        // curiosity: head tilt 0 → -0.6 → 0.3 → 0
        animate(px, [px.get(), -0.55, 0.28, 0], { duration: 1.2, ease: 'easeInOut' })
        animate(py, [py.get(), 0.1, 0], { duration: 1.2, ease: 'easeInOut' })
      }, 1800)
    },
    [px, py]
  )

  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [onMove])

  // random blink every 3–7s
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 130)
        loop()
      }, 3000 + Math.random() * 4000)
    }
    loop()
    return () => clearTimeout(t)
  }, [])

  const doBark = () => {
    setBark(BARKS[Math.floor(Math.random() * BARKS.length)])
    setExcited(true)
    setTimeout(() => setBark(null), 1500)
  }

  const tailDur = hovered ? 0.16 : excited ? 0.26 : 0.5

  return (
    <motion.div
      ref={wrapRef}
      onMouseEnter={() => {
        setHovered(true)
        setExcited(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        setExcited(false)
      }}
      onClick={doBark}
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative select-none"
      style={{ width: 'min(390px, 82vw)', aspectRatio: '420 / 500', cursor: 'pointer' }}
    >
      {/* soft blue background blob (like the reference art) */}
      <div
        aria-hidden
        className="absolute -z-20"
        style={{
          inset: '6% 2% 10% 6%',
          background: 'radial-gradient(60% 55% at 52% 45%, #BBD4FB 0%, #CFE0FB 45%, rgba(207,224,251,0) 72%)',
          borderRadius: '46% 54% 50% 50% / 52% 48% 52% 48%',
        }}
      />
      {/* hover glow */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 rounded-full blur-3xl"
        style={{
          width: '78%',
          height: '78%',
          x: '-50%',
          y: '-48%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.22), rgba(59,130,246,0) 70%)',
        }}
        animate={{ opacity: hovered ? 0.9 : 0.45, scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.4 }}
      />

      <motion.div className="absolute inset-0" style={{ x: bodyX, y: bodyY, rotate: groupTilt }}>
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -9, 0], scale: hovered ? 1.04 : 1 }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 0.3 },
          }}
        >
          <svg viewBox={DOG_VIEWBOX} className="h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <DogDefs />
            <GroundShadow />

            {/* TAIL (behind body) */}
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: '3% 98%' }}
              animate={{ rotate: [-6, 14, -6] }}
              transition={{ duration: tailDur, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Tail />
            </motion.g>

            {/* BODY (breathing) */}
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
              animate={{ scaleY: hovered ? 1 : [1, 1.015, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Body />
            </motion.g>

            <Collar />
            <Tag />

            {/* HEAD rig (follows cursor) — contains ears + face + features */}
            <motion.g
              id="head"
              style={{
                rotate: headRotate,
                x: headX,
                y: headY,
                transformBox: 'fill-box',
                transformOrigin: '50% 92%',
              }}
            >
              <motion.g style={{ transformBox: 'fill-box', transformOrigin: '50% 96%', rotate: earL }}>
                <LeftEar />
              </motion.g>
              <motion.g style={{ transformBox: 'fill-box', transformOrigin: '50% 96%', rotate: earR }}>
                <RightEar />
              </motion.g>

              <HeadFace />
              <Eyebrows />
              <Eyes blink={blink} />
              <motion.g style={{ x: pupilX, y: pupilY }}>
                <Pupils blink={blink} />
              </motion.g>
              <Nose />
              <motion.g
                animate={{ scaleY: hovered ? 1.06 : 1 }}
                style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
                transition={{ duration: 0.25 }}
              >
                <Mouth />
                <motion.g
                  animate={{ y: hovered ? 4 : 0, scaleY: hovered ? 1.08 : 1 }}
                  style={{ transformBox: 'fill-box', transformOrigin: '50% 10%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                >
                  <Tongue />
                </motion.g>
              </motion.g>
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {bark && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="absolute right-[6%] top-[2%] z-20 rounded-2xl border-2 border-blue-400 bg-white px-4 py-2 shadow-xl"
          >
            <span className="text-base font-extrabold text-blue-600">{bark}</span>
            <span className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 border-b-2 border-r-2 border-blue-400 bg-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
