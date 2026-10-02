import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Espelha exatamente public.partner_notifications -- nao tem title/body.
type NotificationRow = {
  id: string;
  partner_id: string;
  type: string;
  message: string;
};

type WebhookPayload = { record?: NotificationRow };

type PushTokenRow = { expo_push_token: string };

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  indicacao_convertida: 'Indicação convertida',
  comissao_liberada: 'Comissão liberada',
  saque_atualizado: 'Saque atualizado',
  elegibilidade_atualizada: 'Elegibilidade atualizada',
  parceiro_aprovado: 'Parceria aprovada',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });

  try {
    const payload = (await request.json()) as WebhookPayload;
    const notification = payload.record;
    if (!notification?.partner_id) {
      return new Response(JSON.stringify({ skipped: true }), { headers: { ...headers, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: tokens, error } = await supabase
      .from('partner_push_tokens')
      .select('expo_push_token')
      .eq('partner_id', notification.partner_id);
    if (error) throw error;

    const messages = ((tokens ?? []) as PushTokenRow[]).map((token) => ({
      to: token.expo_push_token,
      sound: 'default',
      title: NOTIFICATION_TYPE_LABELS[notification.type] ?? 'Patas & Passos',
      body: notification.message ?? 'Você recebeu uma nova atualização.',
      data: { notificationId: notification.id, type: notification.type },
    }));

    if (messages.length > 0) {
      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });
      if (!expoResponse.ok) throw new Error(`Expo Push returned ${expoResponse.status}`);
    }

    return new Response(JSON.stringify({ sent: messages.length }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
