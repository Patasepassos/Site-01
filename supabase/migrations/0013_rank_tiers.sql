-- Patas & Passos — Portal do Parceiro
-- Ranks/gamificação do parceiro (Filhote → Companheiro → Lion de Ouro →
-- Tigre Platina → Wolf Lenda Plus). Metas e "benefícios de vitrine" são
-- 100% configuráveis pelo admin em /admin/ranks -- nada hardcoded no código.
--
-- IMPORTANTE: base_percentage/recurring_percentage/bonus_text aqui são
-- SÓ EXIBIÇÃO/motivacionais pro parceiro ver o que cada nível representa.
-- O cálculo REAL de comissão continua 100% via commission_rules/admin/regras
-- e o motor em lib/partners/commission-engine.ts -- esta tabela nunca é lida
-- por ele. Evita comissão "falsa": o que é pago sempre vem só da regra real.
-- Rode DEPOIS de 0001..0012.

create table if not exists public.rank_tiers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('filhote', 'companheiro', 'lion_ouro', 'tigre_platina', 'wolf_lenda')),
  label text not null,
  emoji text not null,
  min_clients int not null check (min_clients >= 0),
  base_percentage numeric(5,2) not null default 0 check (base_percentage >= 0),
  recurring_percentage numeric(5,2) not null default 0 check (recurring_percentage >= 0),
  bonus_text text not null default '',
  led_style text not null default 'none' check (led_style in ('none', 'static', 'pulse_gold', 'neon', 'aura')),
  sort_order int not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.rank_tiers (key, label, emoji, min_clients, base_percentage, recurring_percentage, bonus_text, led_style, sort_order) values
  ('filhote', 'Filhote', '🐶', 0, 0, 0, 'Continue indicando para desbloquear sua primeira comissão.', 'none', 1),
  ('companheiro', 'Companheiro', '🐾', 5, 5, 1, 'Comissão base liberada, com recorrência sobre contratos mensais/anuais.', 'static', 2),
  ('lion_ouro', 'Lion de Ouro', '🦁', 10, 5, 2, 'Bônus adicional sobre a comissão base.', 'pulse_gold', 3),
  ('tigre_platina', 'Tigre Platina', '🐯', 20, 5, 2, 'Bônus maior + prêmios exclusivos Patas & Passos.', 'neon', 4),
  ('wolf_lenda', 'Wolf Lenda Plus', '🐺', 40, 5, 5, 'Maior bônus do programa e recorrência máxima.', 'aura', 5)
on conflict (key) do nothing;
