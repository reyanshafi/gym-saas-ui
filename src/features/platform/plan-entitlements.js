export const planFeatureIndex = 4;

export function decodePlanFeatures(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const decoded = JSON.parse(value);
    return Array.isArray(decoded) &&
      decoded.every((id) => typeof id === "string")
      ? decoded
      : null;
  } catch {
    return null;
  }
}

export function planFeatureIds(
  plan,
  features,
  legacyPlanNames,
  legacyHeadings,
) {
  const saved = decodePlanFeatures(plan?.values[planFeatureIndex]);
  if (saved) return saved;
  const seedIndex = /^sample-(\d+)$/.exec(plan?.id ?? "")?.[1];
  const legacyName =
    seedIndex === undefined
      ? plan?.values[0]
      : legacyPlanNames[Number(seedIndex)];
  const column = legacyHeadings.indexOf(legacyName);
  return column > 0
    ? features
        .filter(({ values }) => values[column] === "Included")
        .map(({ id }) => id)
    : [];
}
