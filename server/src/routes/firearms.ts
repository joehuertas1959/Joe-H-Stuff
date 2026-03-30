import { Router } from 'express';
import { prisma } from '../db/prisma';
import { upsertVector } from '../db/vector';

export const firearmsRouter = Router();

firearmsRouter.get('/', async (_req, res) => {
  const firearms = await prisma.firearm.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(firearms);
});

firearmsRouter.get('/:id', async (req, res) => {
  const firearm = await prisma.firearm.findUnique({
    where: { id: req.params.id },
    include: { registrations: { include: { person: true } }, transactions: true },
  });
  if (!firearm) return res.status(404).json({ error: 'Not found' });
  res.json(firearm);
});

firearmsRouter.get('/serial/:serial', async (req, res) => {
  const firearm = await prisma.firearm.findUnique({ where: { serialNumber: req.params.serial } });
  if (!firearm) return res.status(404).json({ error: 'Not found' });
  res.json(firearm);
});

firearmsRouter.post('/', async (req, res) => {
  const firearm = await prisma.firearm.create({ data: req.body });
  await upsertVector('Firearm', firearm.id,
    `${firearm.type} ${firearm.make} ${firearm.model} ${firearm.caliber} serial ${firearm.serialNumber}`);
  res.status(201).json(firearm);
});

firearmsRouter.put('/:id', async (req, res) => {
  const firearm = await prisma.firearm.update({ where: { id: req.params.id }, data: req.body });
  await upsertVector('Firearm', firearm.id,
    `${firearm.type} ${firearm.make} ${firearm.model} ${firearm.caliber} serial ${firearm.serialNumber}`);
  res.json(firearm);
});
