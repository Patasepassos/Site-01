/**
 * Layered vector artwork for the Patas & Passos mascot — v2 (volume + fur).
 * Each part is a named <g id="..."> so it can be rigged independently in
 * Framer Motion / GSAP, or imported into Rive / Figma / Illustrator.
 *
 * viewBox: 0 0 420 500
 *
 * Pivots (animation transform-origin, in viewBox units):
 *   head 210,252 (neck) · left_ear 150,150 · right_ear 290,150
 *   tail 272,398 · body 210,470 (breathing) · pupils translate
 */
import * as React from 'react'

export const DOG_VIEWBOX = '0 0 420 500'

export function DogDefs() {
  return (
    <defs>
      <radialGradient id="furHead" cx="0.4" cy="0.32" r="0.85">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.7" stopColor="#FBFCFE" />
        <stop offset="1" stopColor="#E3E9F3" />
      </radialGradient>
      <radialGradient id="furBody" cx="0.42" cy="0.28" r="0.9">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.72" stopColor="#F8FAFD" />
        <stop offset="1" stopColor="#DFE6F1" />
      </radialGradient>
      <linearGradient id="muzzle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#EEF2F9" />
      </linearGradient>
      <linearGradient id="earInner" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor="#5C6675" />
        <stop offset="1" stopColor="#333B49" />
      </linearGradient>
      <radialGradient id="eyeGrad" cx="0.38" cy="0.32" r="0.85">
        <stop offset="0" stopColor="#3A4150" />
        <stop offset="0.45" stopColor="#1A1E27" />
        <stop offset="1" stopColor="#0C0E13" />
      </radialGradient>
      <radialGradient id="tagGrad" cx="0.38" cy="0.32" r="0.85">
        <stop offset="0" stopColor="#4F93FF" />
        <stop offset="1" stopColor="#1D4ED8" />
      </radialGradient>
      <radialGradient id="tongueGrad" cx="0.5" cy="0.2" r="0.9">
        <stop offset="0" stopColor="#FF8194" />
        <stop offset="1" stopColor="#E0394C" />
      </radialGradient>
      <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#1E2A4A" floodOpacity="0.13" />
      </filter>
    </defs>
  )
}

export const GroundShadow = (p: React.SVGProps<SVGEllipseElement>) => (
  <ellipse id="shadow" cx="212" cy="480" rx="108" ry="18" fill="#1E2A4A" opacity="0.09" {...p} />
)

export const Tail = ({ children, ...p }: React.SVGProps<SVGGElement>) => (
  <g id="tail" {...p}>
    <path
      d="M280 396 C306 392 330 372 340 344 C347 324 344 303 331 297
         C330 312 322 327 308 343 C296 357 286 374 280 396 Z"
      fill="url(#furBody)"
      stroke="#E2E8F2"
      strokeWidth="1.5"
    />
    <path
      d="M288 388 C309 383 329 366 338 343 C344 326 341 309 331 303
         C330 315 323 329 311 343 C300 356 291 371 288 388 Z"
      fill="#EAEFF7"
      opacity="0.5"
    />
    {children}
  </g>
)

export const Body = ({ children, ...p }: React.SVGProps<SVGGElement>) => (
  <g id="body" {...p}>
    <g filter="url(#soft)">
      <path
        d="M150 276 C122 306 114 356 122 402 C128 444 150 470 184 474
           L240 474 C274 470 296 444 302 402 C310 356 302 306 274 276
           C250 296 174 296 150 276 Z"
        fill="url(#furBody)"
      />
    </g>
    {/* back haunches (sitting) */}
    <ellipse cx="150" cy="430" rx="34" ry="46" fill="url(#furBody)" />
    <ellipse cx="274" cy="430" rx="34" ry="46" fill="url(#furBody)" />
    {/* hip patch */}
    <ellipse cx="286" cy="404" rx="20" ry="27" fill="#C6D0E0" transform="rotate(10 286 404)" opacity="0.95" />
    {/* chest ambient shade under the chin */}
    <path d="M168 300 C188 318 232 318 252 300 C246 344 210 360 210 360 C210 360 174 344 168 300 Z"
          fill="#E4EAF3" opacity="0.65" />
    {/* front legs */}
    <path d="M176 372 C168 410 170 446 180 472 L206 472 C204 446 202 410 202 372 Z"
          fill="url(#furBody)" />
    <path d="M244 372 C252 410 250 446 240 472 L214 472 C216 446 218 410 218 372 Z"
          fill="url(#furBody)" />
    <path d="M210 366 L210 470" stroke="#E4EAF3" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    {/* front paws */}
    <ellipse cx="189" cy="470" rx="24" ry="15" fill="#FFFFFF" stroke="#E6ECF5" strokeWidth="1.5" />
    <ellipse cx="231" cy="470" rx="24" ry="15" fill="#FFFFFF" stroke="#E6ECF5" strokeWidth="1.5" />
    <path d="M182 467 L182 477 M189 469 L189 479 M196 467 L196 477"
          stroke="#D8E0EC" strokeWidth="2" strokeLinecap="round" />
    <path d="M224 467 L224 477 M231 469 L231 479 M238 467 L238 477"
          stroke="#D8E0EC" strokeWidth="2" strokeLinecap="round" />
    {children}
  </g>
)

export const Collar = (p: React.SVGProps<SVGGElement>) => (
  <g id="collar" {...p}>
    <path
      d="M150 256 C178 274 242 274 270 256 C272 266 271 276 266 285
         C242 298 178 298 154 285 C149 276 148 266 150 256 Z"
      fill="#19212C"
    />
    <path d="M156 261 C180 276 240 276 264 261" stroke="#3A4655" strokeWidth="3"
          fill="none" strokeLinecap="round" opacity="0.85" />
  </g>
)

export const Tag = (p: React.SVGProps<SVGGElement>) => (
  <g id="tag" {...p}>
    <rect x="203" y="280" width="14" height="12" rx="4" fill="#94A3B8" />
    <circle cx="210" cy="310" r="18" fill="url(#tagGrad)" stroke="#1B43C0" strokeWidth="2.5" />
    <circle cx="204" cy="304" r="5" fill="#FFFFFF" opacity="0.25" />
    <ellipse cx="210" cy="314" rx="5.5" ry="4.5" fill="#FFFFFF" />
    <circle cx="203" cy="306" r="2.4" fill="#FFFFFF" />
    <circle cx="210" cy="303" r="2.4" fill="#FFFFFF" />
    <circle cx="217" cy="306" r="2.4" fill="#FFFFFF" />
  </g>
)

export const LeftEar = ({ children, ...p }: React.SVGProps<SVGGElement>) => (
  <g id="left_ear" {...p}>
    <path
      d="M170 116 C156 78 128 44 102 40 C86 56 90 104 116 144
         C130 166 158 162 170 134 Z"
      fill="url(#furHead)"
      stroke="#E2E8F2"
      strokeWidth="1.5"
    />
    <path
      d="M162 120 C150 88 128 60 110 56 C99 72 104 108 126 138
         C137 152 158 148 162 124 Z"
      fill="url(#earInner)"
    />
    {children}
  </g>
)

export const RightEar = ({ children, ...p }: React.SVGProps<SVGGElement>) => (
  <g id="right_ear" {...p}>
    <path
      d="M250 116 C264 78 292 44 318 40 C334 56 330 104 304 144
         C290 166 262 162 250 134 Z"
      fill="url(#furHead)"
      stroke="#E2E8F2"
      strokeWidth="1.5"
    />
    <path
      d="M258 120 C270 88 292 60 310 56 C319 72 314 104 294 134
         C284 150 262 146 258 124 Z"
      fill="#E7EDF6"
      opacity="0.85"
    />
    {children}
  </g>
)

export const HeadFace = ({ children, ...p }: React.SVGProps<SVGGElement>) => (
  <g id="head_face" {...p}>
    <g filter="url(#soft)">
      {/* fluffy silhouette — scalloped fur along the top */}
      <path
        d="M120 158
           C118 118 130 94 150 82
           C156 72 163 76 168 84
           C173 72 181 72 187 83
           C193 71 201 69 210 70
           C219 69 227 71 233 83
           C239 72 247 72 252 84
           C257 76 264 72 270 82
           C290 94 302 118 300 158
           C300 212 270 252 210 256
           C150 252 120 212 120 158 Z"
        fill="url(#furHead)"
      />
    </g>
    {/* side cheek fluff flicks */}
    <path d="M124 178 C116 192 118 210 130 222 C124 206 124 192 132 180 Z" fill="#FFFFFF" />
    <path d="M296 178 C304 192 302 210 290 222 C296 206 296 192 288 180 Z" fill="#FFFFFF" />
    {/* soft top shadow from the ears */}
    <path d="M150 96 C168 110 182 112 196 104 C180 120 158 118 146 104 Z" fill="#E7EDF6" opacity="0.6" />
    <path d="M270 96 C252 110 238 112 224 104 C240 120 262 118 274 104 Z" fill="#E7EDF6" opacity="0.6" />
    {/* muzzle / snout — raised lighter area the nose+mouth sit on */}
    <ellipse cx="210" cy="206" rx="52" ry="44" fill="url(#muzzle)" />
    <path d="M168 188 C180 178 240 178 252 188" stroke="#E4EAF3" strokeWidth="5"
          fill="none" strokeLinecap="round" opacity="0.5" />
    {children}
  </g>
)

export const Eyebrows = (p: React.SVGProps<SVGGElement>) => (
  <g id="eyebrows" fill="none" stroke="#39414F" strokeWidth="4.5" strokeLinecap="round" {...p}>
    <path d="M156 138 Q172 132 187 139" />
    <path d="M233 139 Q248 132 264 138" />
  </g>
)

export const Eyes = ({ blink, ...p }: { blink?: boolean } & React.SVGProps<SVGGElement>) => (
  <g id="eyes" {...p}>
    <g style={{ transform: blink ? 'scaleY(0.08)' : 'scaleY(1)', transformOrigin: '174px 172px', transition: 'transform 90ms' }}>
      <ellipse cx="174" cy="172" rx="21" ry="25" fill="url(#eyeGrad)" />
    </g>
    <g style={{ transform: blink ? 'scaleY(0.08)' : 'scaleY(1)', transformOrigin: '246px 172px', transition: 'transform 90ms' }}>
      <ellipse cx="246" cy="172" rx="21" ry="25" fill="url(#eyeGrad)" />
    </g>
  </g>
)

export const Pupils = ({ blink, ...p }: { blink?: boolean } & React.SVGProps<SVGGElement>) => (
  <g id="pupils" style={{ opacity: blink ? 0 : 1 }} {...p}>
    <circle cx="167" cy="163" r="7" fill="#FFFFFF" />
    <circle cx="180" cy="180" r="3.2" fill="#FFFFFF" opacity="0.9" />
    <circle cx="239" cy="163" r="7" fill="#FFFFFF" />
    <circle cx="252" cy="180" r="3.2" fill="#FFFFFF" opacity="0.9" />
  </g>
)

export const Nose = (p: React.SVGProps<SVGGElement>) => (
  <g id="nose" {...p}>
    <path
      d="M210 188 C224 188 233 197 231 206 C229 214 220 219 210 219
         C200 219 191 214 189 206 C187 197 196 188 210 188 Z"
      fill="#15171C"
    />
    <ellipse cx="204" cy="197" rx="5" ry="3.2" fill="#4B5567" opacity="0.9" />
  </g>
)

export const Mouth = ({ children, ...p }: React.SVGProps<SVGGElement>) => (
  <g id="mouth" {...p}>
    <path d="M210 219 L210 228" stroke="#15171C" strokeWidth="3" strokeLinecap="round" />
    {/* gentle open smile */}
    <path
      d="M210 228 C198 230 184 234 176 240 C186 264 200 272 210 272
         C220 272 234 264 244 240 C236 234 222 230 210 228 Z"
      fill="#2A1721"
    />
    {children}
  </g>
)

export const Tongue = (p: React.SVGProps<SVGGElement>) => (
  <g id="tongue" {...p}>
    <path
      d="M192 246 C192 238 228 238 228 246 C228 262 220 270 210 270
         C200 270 192 262 192 246 Z"
      fill="url(#tongueGrad)"
    />
    <path d="M210 250 L210 268" stroke="#C7344A" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <ellipse cx="203" cy="250" rx="6" ry="3" fill="#FFB3BE" opacity="0.85" />
  </g>
)
