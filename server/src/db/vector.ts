// Vector search stub — no external dependencies required.
// upsertVector calls are silently ignored; search uses Prisma text queries instead.

export async function upsertVector(
  _entityType: string,
  _entityId: string,
  _text: string,
  _meta: Record<string, unknown> = {}
): Promise<void> {
  // no-op
}

export async function searchVectors(
  _entityType: string,
  _query: string,
  _limit = 10
): Promise<Array<{ id: string; _distance?: number }>> {
  return [];
}

export async function deleteVector(_entityType: string, _id: string): Promise<void> {
  // no-op
}
