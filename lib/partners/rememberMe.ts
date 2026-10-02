/**
 * Nome do cookie que controla por quanto tempo o login do parceiro fica
 * "lembrado". A sessão do Supabase em si já persiste por padrão (refresh
 * token válido por muito mais tempo que isso) -- esse cookie é o que o
 * middleware confere pra decidir se ainda deixa passar ou força logout:
 *
 * - "Lembrar login por 14 dias" marcado -> cookie com validade de 14 dias.
 * - Desmarcado -> cookie de sessão (sem max-age), que o navegador apaga
 *   sozinho ao fechar -- na próxima visita, sem o cookie, o middleware
 *   desloga de verdade em vez de deixar a sessão antiga seguir valendo.
 *
 * Só presença importa (o próprio navegador já cuida do prazo de validade),
 * então o middleware só precisa checar se o cookie existe.
 */
export const REMEMBER_ME_COOKIE = "pp_remember";
export const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
