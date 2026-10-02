/**
 * Toca um "chime" curto de celebração (3 notas ascendentes) sintetizado via
 * Web Audio API -- sem depender de nenhum arquivo de áudio externo. Discreto
 * de propósito (volume baixo, ~0.6s), pra soar profissional, não infantil.
 * Autoplay de áudio só funciona depois de uma interação do usuário (aqui, o
 * clique em "Quero ser parceiro"); qualquer bloqueio do navegador é
 * silenciosamente ignorado -- nunca deve quebrar o fluxo de cadastro.
 */
export function playCelebrationChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99]; // Dó5, Mi5, Sol5 — acorde maior, soa positivo sem ser infantil
    const noteDuration = 0.18;
    const gap = 0.14;

    notes.forEach((freq, i) => {
      const startTime = ctx.currentTime + i * gap;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    });

    const totalDuration = notes.length * gap + noteDuration;
    setTimeout(() => ctx.close().catch(() => {}), (totalDuration + 0.2) * 1000);
  } catch {
    // Autoplay bloqueado ou Web Audio indisponível -- segue sem som, nunca
    // quebra o cadastro por causa disso.
  }
}
