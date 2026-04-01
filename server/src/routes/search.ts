import { Router } from 'express';
import { prisma } from '../db/prisma';

export const searchRouter = Router();

/**
 * GET /api/search?q=<query>&type=<entityType>&limit=<n>
 *
 * Full-text search using Prisma's `contains` (SQL LIKE) operator.
 * Searches Person, Firearm, Permit, License, Transaction, and LostStolen tables.
 */
searchRouter.get('/', async (req, res) => {
  const q     = String(req.query.q ?? '').trim();
  const type  = String(req.query.type ?? 'all');
  const limit = Math.min(Number(req.query.limit ?? 10), 50);

  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

  const results: unknown[] = [];

  if (type === 'all' || type === 'Person') {
    const persons = await prisma.person.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName:  { contains: q } },
          { address:   { contains: q } },
          { city:      { contains: q } },
          { email:     { contains: q } },
          { phone:     { contains: q } },
        ],
      },
      take: limit,
    });
    persons.forEach(r => results.push({ entityType: 'Person', score: 0, record: r }));
  }

  if (type === 'all' || type === 'Firearm') {
    const firearms = await prisma.firearm.findMany({
      where: {
        OR: [
          { make:         { contains: q } },
          { model:        { contains: q } },
          { serialNumber: { contains: q } },
          { caliber:      { contains: q } },
          { type:         { contains: q } },
        ],
      },
      take: limit,
    });
    firearms.forEach(r => results.push({ entityType: 'Firearm', score: 0, record: r }));
  }

  if (type === 'all' || type === 'Permit') {
    const permits = await prisma.permit.findMany({
      where: {
        OR: [
          { permitNumber: { contains: q } },
          { status:       { contains: q } },
          { type:         { contains: q } },
          { person: { firstName: { contains: q } } },
          { person: { lastName:  { contains: q } } },
        ],
      },
      include: { person: true },
      take: limit,
    });
    permits.forEach(r => results.push({ entityType: 'Permit', score: 0, record: r }));
  }

  if (type === 'all' || type === 'License') {
    const licenses = await prisma.license.findMany({
      where: {
        OR: [
          { licenseNumber: { contains: q } },
          { status:        { contains: q } },
          { type:          { contains: q } },
          { person: { firstName: { contains: q } } },
          { person: { lastName:  { contains: q } } },
        ],
      },
      include: { person: true },
      take: limit,
    });
    licenses.forEach(r => results.push({ entityType: 'License', score: 0, record: r }));
  }

  if (type === 'all' || type === 'Transaction') {
    const txs = await prisma.transaction.findMany({
      where: {
        OR: [
          { ticketNumber: { contains: q } },
          { type:         { contains: q } },
          { firearm: { make:         { contains: q } } },
          { firearm: { model:        { contains: q } } },
          { firearm: { serialNumber: { contains: q } } },
        ],
      },
      include: { firearm: true },
      take: limit,
    });
    txs.forEach(r => results.push({ entityType: 'Transaction', score: 0, record: r }));
  }

  if (type === 'all' || type === 'LostStolen') {
    const reports = await prisma.lostStolenReport.findMany({
      where: {
        OR: [
          { reportNumber: { contains: q } },
          { type:         { contains: q } },
          { description:  { contains: q } },
          { location:     { contains: q } },
          { firearm: { make:         { contains: q } } },
          { firearm: { serialNumber: { contains: q } } },
        ],
      },
      include: { firearm: true },
      take: limit,
    });
    reports.forEach(r => results.push({ entityType: 'LostStolen', score: 0, record: r }));
  }

  res.json((results as unknown[]).slice(0, limit));
});
