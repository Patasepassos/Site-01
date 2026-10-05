import type { RankKey } from "@/lib/supabase/types";

/**
 * Som de evolução de Rank, sintetizado via Web Audio API (sem arquivo de
 * áudio externo) -- mesma técnica de lib/sound/celebration.ts. Cada nível
 * tem um "perfil" sonoro: um arpejo de subida (a energia crescendo) seguido
 * de um "baque" de impacto no instante em que o emblema fica gigante.
 * Filhote soa agudo e fofo; os níveis maiores ficam mais graves, longos e
 * épicos -- inclusive com um estouro de ruído filtrado simulando o "boom"
 * de impacto, coisa que seria exagerada/estridente demais pro Filhote.
 */

type RankSoundProfile = {
  /** Arpejo ascendente (Hz), tocado em sequência rápida até o impacto. */
  notes: number[];
  noteDuration: number;
  gap: number;
  waveform: OscillatorType;
  /** Frequência do "baque" grave no pico da animação de impacto. */
  impactFreq: number;
  /** Impacto mais longo/forte + estouro de ruído = níveis mais épicos. */
  impactDuration: number;
  withNoiseBurst: boolean;
};

const PROFILES: Record<RankKey, RankSoundProfile> = {
  filhote: {
    notes: [784, 988, 1245, 1568],
    noteDuration: 0.08,
    gap: 0.06,
    waveform: "triangle",
    impactFreq: 300,
    impactDuration: 0.22,
    withNoiseBurst: false,
  },
  companheiro: {
    notes: [523, 659, 784, 1047],
    noteDuration: 0.11,
    gap: 0.08,
    waveform: "sine",
    impactFreq: 200,
    impactDuration: 0.3,
    withNoiseBurst: false,
  },
  lion_ouro: {
    notes: [392, 494, 587, 784, 988],
    noteDuration: 0.13,
    gap: 0.09,
    waveform: "sawtooth",
    impactFreq: 110,
    impactDuration: 0.42,
    withNoiseBurst: true,
  },
  tigre_platina: {
    notes: [330, 415, 523, 659, 831, 1047],
    noteDuration: 0.12,
    gap: 0.08,
    waveform: "square",
    impactFreq: 90,
    impactDuration: 0.46,
    withNoiseBurst: true,
  },
  wolf_lenda: {
    notes: [261, 329, 392, 523, 659, 784, 1047],
    noteDuration: 0.14,
    gap: 0.1,
    waveform: "sawtooth",
    impactFreq: 65,
    impactDuration: 0.6,
    withNoiseBurst: true,
  },
};

function getAudioContextClass(): typeof AudioContext | null {
  return (
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null
  );
}

/** Estouro curto de ruído branco filtrado -- o "boom" de impacto dos níveis mais altos. */
function scheduleNoiseBurst(ctx: AudioContext, startTime: number, duration: number): void {
  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, startTime);
  filter.frequency.exponentialRampToValueAtTime(120, startTime + duration);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.18, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start(startTime);
  noise.stop(startTime + duration);
}

/** Toca o som de evolução para o Rank informado. Nunca lança -- autoplay bloqueado é ignorado. */
export function playRankUpSound(rankKey: RankKey): void {
  try {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;

    const profile = PROFILES[rankKey];
    const ctx = new AudioContextClass();

    // 1) Arpejo de subida: a energia crescendo nota a nota até o impacto.
    profile.notes.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * (profile.noteDuration + profile.gap);
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = profile.waveform;
      oscillator.frequency.value = freq;

      const peak = 0.07 + (i / profile.notes.length) * 0.08;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(peak, startTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + profile.noteDuration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + profile.noteDuration);
    });

    // 2) Baque de impacto, exatamente quando o arpejo termina (mesmo
    // instante em que a animação CSS do emblema atinge o pico "gigante").
    const impactTime = ctx.currentTime + profile.notes.length * (profile.noteDuration + profile.gap);
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = "sine";
    impactOsc.frequency.setValueAtTime(profile.impactFreq, impactTime);
    impactOsc.frequency.exponentialRampToValueAtTime(profile.impactFreq * 0.6, impactTime + profile.impactDuration);

    impactGain.gain.setValueAtTime(0, impactTime);
    impactGain.gain.linearRampToValueAtTime(0.22, impactTime + 0.01);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + profile.impactDuration);

    impactOsc.connect(impactGain);
    impactGain.connect(ctx.destination);
    impactOsc.start(impactTime);
    impactOsc.stop(impactTime + profile.impactDuration);

    if (profile.withNoiseBurst) scheduleNoiseBurst(ctx, impactTime, profile.impactDuration * 0.7);

    const totalDuration = profile.notes.length * (profile.noteDuration + profile.gap) + profile.impactDuration;
    setTimeout(() => ctx.close().catch(() => {}), (totalDuration + 0.3) * 1000);
  } catch {
    // Autoplay bloqueado ou Web Audio indisponível -- segue sem som.
  }
}
