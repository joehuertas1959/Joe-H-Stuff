import { Router } from 'express';
import { prisma } from '../db/prisma';

export const serializationRouter = Router();

const PREFIX: Record<string, string> = {
  Pistol: 'HIFRB-P',
  Revolver: 'HIFRB-R',
  Rifle: 'HIFRB-RI',
  Shotgun: 'HIFRB-S',
  'Machine Gun': 'HIFRB-M',
  'Assault Weapon': 'HIFRB-A',
  'Frame/Receiver': 'HIFRB-FR',
};

serializationRouter.get('/', async (_req, res) => {
  const requests = await prisma.serializationRequest.findMany({
    include: { applicant: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
});

serializationRouter.get('/:id', async (req, res) => {
  const request = await prisma.serializationRequest.findUnique({
    where: { id: req.params.id },
    include: { applicant: true },
  });
  if (!request) return res.status(404).json({ error: 'Not found' });
  res.json(request);
});

serializationRouter.post('/', async (req, res) => {
  const prefix = PREFIX[req.body.firearmType] ?? 'HIFRB-X';
  const rand = Math.floor(100000000 + Math.random() * 900000000);
  const serialNumber = `${prefix}-${rand}`;

  const request = await prisma.serializationRequest.create({
    data: { ...req.body, serialNumber },
    include: { applicant: true },
  });
  res.status(201).json(request);
});

serializationRouter.put('/:id', async (req, res) => {
  const request = await prisma.serializationRequest.update({
    where: { id: req.params.id },
    data: req.body,
    include: { applicant: true },
  });
  res.json(request);
});
