import { Router } from 'express';
import { prisma } from '../db/prisma';
import { upsertVector } from '../db/vector';

export const transactionsRouter = Router();

transactionsRouter.get('/', async (_req, res) => {
  const txs = await prisma.transaction.findMany({
    include: { firearm: true, seller: true, buyer: true, dealer: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(txs);
});

transactionsRouter.get('/:id', async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: { firearm: true, seller: true, buyer: true, dealer: true },
  });
  if (!tx) return res.status(404).json({ error: 'Not found' });
  res.json(tx);
});

transactionsRouter.post('/', async (req, res) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  const ticketNumber = `HPD-SHF-${year}-${rand}`;

  const tx = await prisma.transaction.create({
    data: { ...req.body, ticketNumber },
    include: { firearm: true, seller: true, buyer: true, dealer: true },
  });

  await upsertVector('Transaction', tx.id,
    `transaction ${ticketNumber} type ${tx.type} firearm ${tx.firearm.make} ${tx.firearm.model} serial ${tx.firearm.serialNumber}`);
  res.status(201).json(tx);
});

transactionsRouter.put('/:id', async (req, res) => {
  const tx = await prisma.transaction.update({
    where: { id: req.params.id },
    data: req.body,
    include: { firearm: true, seller: true, buyer: true, dealer: true },
  });
  res.json(tx);
});
