import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateUniqueCoupon } from "@/lib/partners/coupon";
import { logAudit } from "@/lib/partners/audit";
import {
  isValidCpfOrCnpj,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidPixKey,
  onlyDigits,
  PIX_KEY_TYPES,
} from "@/lib/partners/validation";
import type { PixKeyType } from "@/lib/supabase/types";

type CadastroBody = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  cpfCnpj?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  pixKey?: unknown;
  pixKeyType?: unknown;
  termsAccepted?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: CadastroBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Corpo da requisição inválido.");
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const cpfCnpj = typeof body.cpfCnpj === "string" ? body.cpfCnpj.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
  const pixKey = typeof body.pixKey === "string" ? body.pixKey.trim() : "";
  const pixKeyType = typeof body.pixKeyType === "string" ? (body.pixKeyType as PixKeyType) : null;
  const termsAccepted = body.termsAccepted === true;

  if (fullName.length < 3) return badRequest("Informe o nome completo.");
  if (!isValidEmail(email)) return badRequest("E-mail inválido.");
  if (!isValidPhone(phone)) return badRequest("WhatsApp inválido.");
  if (!isValidCpfOrCnpj(cpfCnpj)) return badRequest("CPF ou CNPJ inválido.");
  if (!isValidPassword(password)) return badRequest("A senha precisa ter pelo menos 8 caracteres.");
  if (password !== confirmPassword) return badRequest("As senhas não coincidem.");
  if (!pixKeyType || !PIX_KEY_TYPES.includes(pixKeyType)) return badRequest("Tipo de chave Pix inválido.");
  if (!isValidPixKey(pixKeyType, pixKey)) return badRequest("Chave Pix inválida para o tipo selecionado.");
  if (!termsAccepted) return badRequest("É necessário aceitar os termos da parceria.");

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: created, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !created.user) {
    const message = createUserError?.message.includes("already been registered")
      ? "Este e-mail já está cadastrado."
      : "Não foi possível criar sua conta. Tente novamente.";
    return badRequest(message);
  }

  const userId = created.user.id;

  try {
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      role: "partner",
      full_name: fullName,
      phone: onlyDigits(phone),
    });
    if (profileError) throw profileError;

    const couponCode = await generateUniqueCoupon(supabaseAdmin, fullName);

    const { data: partner, error: partnerError } = await supabaseAdmin
      .from("partners")
      .insert({
        profile_id: userId,
        status: "pending",
        cpf_cnpj: onlyDigits(cpfCnpj),
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        coupon_code: couponCode,
      })
      .select("id, coupon_code")
      .single();
    if (partnerError || !partner) throw partnerError ?? new Error("Falha ao criar parceiro.");

    await logAudit(supabaseAdmin, {
      actorId: userId,
      actorRole: "partner",
      action: "partner_signup",
      entityType: "partner",
      entityId: partner.id,
    });

    return NextResponse.json({ success: true, couponCode: partner.coupon_code });
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    console.error("Erro no cadastro de parceiro:", message);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
