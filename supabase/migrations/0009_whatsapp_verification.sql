-- Patas & Passos — Portal do Parceiro
-- Verificação real de WhatsApp via Twilio Verify. Reaproveita
-- partners.whatsapp_verified (já existia, migração 0005) — só adiciona a
-- data da verificação, no mesmo padrão de cpf_verified_at/email_verified_at.
-- Rode DEPOIS de 0001..0008.

alter table public.partners add column if not exists whatsapp_verified_at timestamptz;
