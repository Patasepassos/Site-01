// Avaliações reais de clientes da Patas & Passos (Google).
// Não invente novos depoimentos aqui — adicione apenas avaliações reais e verificadas.

export type Testimonial = {
  quote: string;
  initial: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Super atenciosos e acolhedores, Nala e Nina ficaram muito bem cuidadas durante a hospedagem com o casal, que inclusive levaram para passeio. Recomendo também Dra Mariana como médica veterinária!",
    initial: "F",
    name: "Fernanda Fischler",
    role: "avaliação no Google · tutora de Nala e Nina",
  },
  {
    quote:
      "Sensacional, super cuidadosos e atenciosos o tempo todo. Recebi fotos e vídeos, minha cachorrinha amou muito e se divertiu muito. Super recomendo e com toda certeza vou deixar mais vezes.",
    initial: "C",
    name: "Carla Barros",
    role: "avaliação no Google",
  },
  {
    quote: "Excelente profissionais, de extrema confiança, super recomendo.",
    initial: "J",
    name: "Julia Macedo Nunes",
    role: "avaliação no Google",
  },
  {
    quote: "Excelente profissional, gostei muito.",
    initial: "J",
    name: "Jhosy Santos",
    role: "avaliação no Google",
  },
  {
    quote: "A melhor experiência que eu poderia ter com cuidados com meu pet, sem dúvidas! Muito obrigada!",
    initial: "V",
    name: "Vitória Santos",
    role: "avaliação no Google",
  },
  {
    quote: "Cuidado e prestatividade, recomendo.",
    initial: "W",
    name: "Welington",
    role: "avaliação no Google",
  },
];
