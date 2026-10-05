import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { validatePasswordPolicy } from "@/lib/partners/password-policy";
import { isValidEmail, isValidPhone, onlyDigits } from "@/lib/partners/validation";
import { describeError } from "@/lib/partners/errors";

/**
 * Cria um OPERADOR — nunca outro admin por aqui. Promover alguém a admin é
 * uma ação sensível demais pra um formulário simples; hoje só é possível
 * diretamente no banco, de propósito.
 */
export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { fullName?: unknown; email?: unknown; phone?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (fullName.length < 3) return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  if (!isValidPhone(phone)) return NextResponse.json({ error: "WhatsApp inválido." }, { status: 400 });

  const passwordError = validatePasswordPolicy(password, { fullName, email, phone });
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: created, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !created.user) {
    const message = createUserError?.message.includes("already been registered")
      ? "Este e-mail já está cadastrado."
      : "Não foi possível criar a conta.";
    if (!createUserError?.message.includes("already been registered")) {
      console.error("Erro ao criar operador:", describeError(createUserError));
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = created.user.id;

  try {
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      role: "operator",
      full_name: fullName,
      phone: onlyDigits(phone),
      active: true,
    });
    if (profileError) throw profileError;

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: "admin",
      action: "user_created",
      entityType: "profile",
      entityId: userId,
      metadata: { role: "operator", email },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error("Erro ao criar operador:", describeError(err));
    return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
  }
}
