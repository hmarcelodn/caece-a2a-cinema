export function buildCinemaMessage(answers: Record<string, string>): string {
  const lines = Object.entries(answers)
    .filter(([, value]) => value.trim().length > 0)
    .map(([question, answer]) => `${question} ${answer}`);

  const context =
    lines.length > 0
      ? lines.join("\n")
      : "Sin contexto adicional del wizard.";

  return [
    "Recomendame UNA sola película ideal para esta noche según mi contexto.",
    "Respondé con el JSON estructurado de recomendación (movie_title, movie_overview, etc.).",
    "",
    "Contexto del usuario:",
    context,
  ].join("\n");
}
