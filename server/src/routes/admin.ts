import { Router } from 'express';
import { prisma } from '../db/prisma';

export const adminRouter = Router();

// Dashboard stats
adminRouter.get('/stats', async (_req, res) => {
  const [persons, firearms, permits, licenses, transactions, reports] = await Promise.all([
    prisma.person.count(),
    prisma.firearm.count(),
    prisma.permit.count(),
    prisma.license.count(),
    prisma.transaction.count(),
    prisma.lostStolenReport.count({ where: { status: 'open' } }),
  ]);

  const pendingPermits  = await prisma.permit.count({ where: { status: 'pending' } });
  const pendingLicenses = await prisma.license.count({ where: { status: 'pending' } });

  // Approaching 120-day LTC deadlines (within 14 days)
  const soon = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const approachingDeadlines = await prisma.license.count({
    where: { status: 'pending', expiresAt: { lte: soon } },
  });

  res.json({
    persons, firearms, permits, licenses, transactions,
    openReports: reports, pendingPermits, pendingLicenses, approachingDeadlines,
  });
});

// Messages
adminRouter.get('/messages', async (_req, res) => {
  const messages = await prisma.adminMessage.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(messages);
});

adminRouter.post('/messages', async (req, res) => {
  const msg = await prisma.adminMessage.create({ data: req.body });
  res.status(201).json(msg);
});

adminRouter.delete('/messages/:id', async (req, res) => {
  await prisma.adminMessage.update({ where: { id: req.params.id }, data: { active: false } });
  res.status(204).send();
});

// Expired permits
adminRouter.get('/expired-permits', async (_req, res) => {
  const now = new Date();
  const expired = await prisma.permit.findMany({
    where: { status: { not: 'expired' }, expiresAt: { lt: now } },
    include: { person: true },
    orderBy: { expiresAt: 'asc' },
  });
  res.json(expired);
});
