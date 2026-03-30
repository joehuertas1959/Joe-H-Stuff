import { Router } from 'express';
import { prisma } from '../db/prisma';
import { upsertVector } from '../db/vector';

export const licensesRouter = Router();

licensesRouter.get('/', async (_req, res) => {
  const licenses = await prisma.license.findMany({
    include: { person: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(licenses);
});

licensesRouter.get('/:id', async (req, res) => {
  const license = await prisma.license.findUnique({
    where: { id: req.params.id },
    include: { person: true },
  });
  if (!license) return res.status(404).json({ error: 'Not found' });
  res.json(license);
});

licensesRouter.post('/', async (req, res) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  const licenseNumber = `LTC-${year}-${rand}`;
  // LTC expires 1 year from approval; set processing deadline at 120 days
  const processingDeadline = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);

  const license = await prisma.license.create({
    data: { ...req.body, licenseNumber, expiresAt: processingDeadline },
    include: { person: true },
  });

  await upsertVector('License', license.id,
    `license ${licenseNumber} type ${license.type} status ${license.status} person ${license.person.firstName} ${license.person.lastName}`);
  res.status(201).json(license);
});

licensesRouter.put('/:id', async (req, res) => {
  const license = await prisma.license.update({
    where: { id: req.params.id },
    data: req.body,
    include: { person: true },
  });
  res.json(license);
});
