import { Router } from 'express';
import { prisma } from '../db/prisma';

export const dealersRouter = Router();

dealersRouter.get('/', async (_req, res) => {
  const dealers = await prisma.dealer.findMany({ orderBy: { name: 'asc' } });
  res.json(dealers);
});

dealersRouter.get('/:id', async (req, res) => {
  const dealer = await prisma.dealer.findUnique({
    where: { id: req.params.id },
    include: { transactions: { include: { firearm: true } } },
  });
  if (!dealer) return res.status(404).json({ error: 'Not found' });
  res.json(dealer);
});

dealersRouter.post('/', async (req, res) => {
  const dealer = await prisma.dealer.create({ data: req.body });
  res.status(201).json(dealer);
});

dealersRouter.put('/:id', async (req, res) => {
  const dealer = await prisma.dealer.update({ where: { id: req.params.id }, data: req.body });
  res.json(dealer);
});
