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
  promoPasseios:
    "Olá! 🐾 Vi a oferta especial no site da Patas & Passos e quero saber como usar o cupom 1CLIENTE nos passeios (dog walker)!",
} as const;

export function waLink(message: string): string {
  return `https://api.whatsapp.com/send?phone=${siteConfig.whatsappPhone}&text=${encodeURIComponent(message)}`;
}

// Localização oficial da Patas & Passos (mesmo mapa/coordenadas fornecidos pelo cliente).
export const location = {
  lat: -23.623071378757448,
  lng: -46.57772602488901,
  embedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.4773148572053!2d-46.57772602488901!3d-23.623071378757448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa8c7075488be59%3A0xd1dc7e15553ccb96!2zUGF0YXMgJiBQYXNzb3MgfCBDdWlkYWRvcyBQZXJzb25hbGl6YWRvcyB8IFBldCBTaXR0ZXIgfCBEb2cgV2Fsa2VyIHwgSG90ZWwgUGV0IHzwn5C-8J-QtvCfkLE!5e0!3m2!1spt-BR!2sbr!4v1788745350461!5m2!1spt-BR!2sbr",
} as const;

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
