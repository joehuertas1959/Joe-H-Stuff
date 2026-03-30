import { Router } from 'express';
import { prisma } from '../db/prisma';
import { searchVectors } from '../db/vector';

export const searchRouter = Router();

/**
 * GET /api/search?q=<query>&type=<entityType>&limit=<n>
 *
 * Runs a vector (semantic) search across the requested entity type and
 * returns the matching records from the SQL database.
 */
searchRouter.get('/', async (req, res) => {
  const q     = String(req.query.q ?? '').trim();
  const type  = String(req.query.type ?? 'all');
  const limit = Math.min(Number(req.query.limit ?? 10), 50);

  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

  const types = type === 'all'
    ? ['Person', 'Firearm', 'Permit', 'License', 'Transaction', 'LostStolen']
    : [type];

  const allResults: any[] = [];

  for (const t of types) {
    const hits = await searchVectors(t, q, limit);
    for (const hit of hits) {
      const record = await fetchRecord(t, hit.id);
      if (record) allResults.push({ entityType: t, score: hit._distance ?? 0, record });
    }
  }

  // Sort by score ascending (lower distance = more similar)
  allResults.sort((a, b) => a.score - b.score);

  res.json(allResults.slice(0, limit));
});

async function fetchRecord(type: string, id: string): Promise<any | null> {
  try {
    switch (type) {
      case 'Person':      return prisma.person.findUnique({ where: { id } });
      case 'Firearm':     return prisma.firearm.findUnique({ where: { id } });
      case 'Permit':      return prisma.permit.findUnique({ where: { id }, include: { person: true } });
      case 'License':     return prisma.license.findUnique({ where: { id }, include: { person: true } });
      case 'Transaction': return prisma.transaction.findUnique({ where: { id }, include: { firearm: true } });
      case 'LostStolen':  return prisma.lostStolenReport.findUnique({ where: { id }, include: { firearm: true } });
      default: return null;
    }
  } catch {
    return null;
  }
}
