// Fonte única da verdade para contato, redes e CTAs da Patas & Passos.
// Dados alinhados ao site oficial e perfil @patas.passos.

export const siteConfig = {
  name: "Patas & Passos",
  tagline: "Mais do que um passeio. Uma jornada de bem-estar.",
  city: "São Caetano do Sul · SP",
  address: "Região de São Caetano e Santo André",
  phoneDisplay: "(11) 91216-4567",
  phoneDisplayAlt: "(11) 91216-4567",
  hours: "Ter-Sex: 18h-20h · Sáb-Dom: 8h-12h",
  whatsappPhone: "5511912164567",
  instagram: "https://www.instagram.com/patas.passos/",
} as const;

export const waMessages = {
  default: "Olá! 👋 Gostaria de informações sobre os serviços da Patas & Passos: 🐶 Dog Walker | 🏡 Pet Sitter | 💉 Vacinação | 🩺 Atendimento Veterinário.",
  passeios:
    "Olá! Vim pelo site da Patas & Passos e gostaria de saber mais sobre os passeios (dog walker).",
  petsitter:
    "Olá! Vim pelo site da Patas & Passos e gostaria de saber mais sobre o pet sitter.",
  hotel: "Olá! Vim pelo site da Patas & Passos e gostaria de saber mais sobre a hospedagem (hotel).",
  vacinas:
    "Olá! Vim pelo site da Patas & Passos e gostaria de saber mais sobre vacinas a domicílio.",
  socializacao:
    "Olá! Vim pelo site da Patas & Passos e gostaria de saber mais sobre os passeios em grupo (socialização).",
  creche:
    "Olá! Vim pelo site da Patas & Passos e gostaria de saber mais sobre a creche (day care) para cães.",
  visita:
    "Olá! 🐾 Vim pelo site da Patas & Passos e gostaria de agendar um atendimento para o meu pet. Quando vocês têm disponibilidade?",
} as const;

export function waLink(message: string): string {
  return `https://api.whatsapp.com/send?phone=${siteConfig.whatsappPhone}&text=${encodeURIComponent(message)}`;
}

export const nav = [
  { href: "/passeios", label: "Passeios" },
  { href: "/socializacao", label: "Socialização" },
  { href: "/pet-sitter", label: "Pet Sitter" },
  { href: "/creche", label: "Creche" },
  { href: "/hotel", label: "Hotel" },
  { href: "/vacinas", label: "Vacinas" },
  { href: "/parceiros", label: "Parceiros" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// Mensagem de WhatsApp adequada à página atual.
export function pageWaMessage(pathname: string): string {
  if (pathname.startsWith("/passeios")) return waMessages.passeios;
  if (pathname.startsWith("/socializacao")) return waMessages.socializacao;
  if (pathname.startsWith("/pet-sitter")) return waMessages.petsitter;
  if (pathname.startsWith("/creche")) return waMessages.creche;
  if (pathname.startsWith("/hotel")) return waMessages.hotel;
  if (pathname.startsWith("/vacinas")) return waMessages.vacinas;
  return waMessages.default;
}
