import { Router } from 'express';
import { prisma } from '../db/prisma';
import { upsertVector } from '../db/vector';

export const permitsRouter = Router();

permitsRouter.get('/', async (_req, res) => {
  const permits = await prisma.permit.findMany({
    include: { person: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(permits);
});

permitsRouter.get('/:id', async (req, res) => {
  const permit = await prisma.permit.findUnique({
    where: { id: req.params.id },
    include: { person: true },
  });
  if (!permit) return res.status(404).json({ error: 'Not found' });
  res.json(permit);
});

permitsRouter.post('/', async (req, res) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  const permitNumber = `PTA-${year}-${rand}`;
  const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

  const permit = await prisma.permit.create({
    data: { ...req.body, permitNumber, expiresAt },
    include: { person: true },
  });

  await upsertVector('Permit', permit.id,
    `permit ${permitNumber} type ${permit.type} status ${permit.status} person ${permit.person.firstName} ${permit.person.lastName}`);
  res.status(201).json(permit);
});

permitsRouter.put('/:id', async (req, res) => {
  const permit = await prisma.permit.update({
    where: { id: req.params.id },
    data: req.body,
    include: { person: true },
  });
  res.json(permit);
});
