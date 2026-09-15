import { location } from "@/lib/site";

const Paw = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <g fill="currentColor">
      <ellipse cx="32" cy="42" rx="18" ry="15" />
      <ellipse cx="14" cy="26" rx="7.5" ry="10" />
      <ellipse cx="28" cy="17" rx="7.5" ry="10.5" />
      <ellipse cx="44" cy="18" rx="7.5" ry="10.5" />
      <ellipse cx="55" cy="29" rx="7" ry="9.5" />
    </g>
  </svg>
);

export default function LocationSection() {
  return (
    <section className="section location-section" id="localizacao">
      <div className="location-inner">
        <div className="location-text reveal">
          <span className="eyebrow"><Paw /> Nosso espaço</span>
          <h2 className="h-lg">
            Venha conhecer a <span className="hl">Patas &amp; Passos</span> 🐾
          </h2>
          <p className="lead">
            Quer conhecer nosso espaço de perto? Será um prazer receber você e apresentar como
            cuidamos do seu pet.
          </p>
          <div className="location-address">
            <span className="location-pin" aria-hidden="true">📍</span>
            <span>São Caetano do Sul – SP</span>
          </div>
        </div>

        <div className="location-map-card reveal">
          <div className="location-paw" aria-hidden="true"><Paw size={18} /></div>
          <div className="location-map-frame">
            <iframe
              src={location.embedSrc}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title="Localização da Patas & Passos no Google Maps"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
