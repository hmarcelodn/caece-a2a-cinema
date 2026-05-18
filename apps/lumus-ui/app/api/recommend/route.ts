import { NextResponse } from "next/server";
import { requestRecommendation } from "../../lib/cinema-manager-client";
import { buildCinemaMessage } from "../../lib/build-cinema-message";

/** BFF: reenvía al cinema manager (caece-cinema-manager POST /recommend). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Body JSON inválido." },
      { status: 400 },
    );
  }

  const answers =
    body &&
    typeof body === "object" &&
    "answers" in body &&
    body.answers &&
    typeof body.answers === "object" &&
    !Array.isArray(body.answers)
      ? (body.answers as Record<string, string>)
      : null;

  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      { ok: false, message: "Se requiere un objeto answers no vacío." },
      { status: 400 },
    );
  }

  const message = buildCinemaMessage(answers);

  try {
    const movie = await requestRecommendation(message);
    return NextResponse.json({ ok: true, movie });
  } catch (e) {
    const errMessage =
      e instanceof Error ? e.message : "Error al contactar el cinema manager.";
    return NextResponse.json({ ok: false, message: errMessage }, { status: 502 });
  }
}
