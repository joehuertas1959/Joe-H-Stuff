import { Router } from 'express';
import { prisma } from '../db/prisma';
import { upsertVector } from '../db/vector';

export const reportsRouter = Router();

reportsRouter.get('/', async (_req, res) => {
  const reports = await prisma.lostStolenReport.findMany({
    include: { firearm: true, reporter: true },
    orderBy: { reportedAt: 'desc' },
  });
  res.json(reports);
});

reportsRouter.get('/:id', async (req, res) => {
  const report = await prisma.lostStolenReport.findUnique({
    where: { id: req.params.id },
    include: { firearm: true, reporter: true },
  });
  if (!report) return res.status(404).json({ error: 'Not found' });
  res.json(report);
});

reportsRouter.post('/', async (req, res) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  const reportNumber = `RPT-${year}-${rand}`;

  const report = await prisma.lostStolenReport.create({
    data: { ...req.body, reportNumber },
    include: { firearm: true, reporter: true },
  });

  await upsertVector('LostStolen', report.id,
    `${report.type} firearm ${report.firearm.make} ${report.firearm.model} serial ${report.firearm.serialNumber} ${report.description ?? ''}`);
  res.status(201).json(report);
});

reportsRouter.put('/:id', async (req, res) => {
  const report = await prisma.lostStolenReport.update({
    where: { id: req.params.id },
    data: req.body,
    include: { firearm: true, reporter: true },
  });
  res.json(report);
});
