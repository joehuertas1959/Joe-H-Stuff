import { Router } from 'express';
import { prisma } from '../db/prisma';
import { upsertVector } from '../db/vector';

export const personsRouter = Router();

personsRouter.get('/', async (_req, res) => {
  const persons = await prisma.person.findMany({ orderBy: { lastName: 'asc' } });
  res.json(persons);
});

personsRouter.get('/:id', async (req, res) => {
  const person = await prisma.person.findUnique({
    where: { id: req.params.id },
    include: { permits: true, licenses: true, registrations: { include: { firearm: true } } },
  });
  if (!person) return res.status(404).json({ error: 'Not found' });
  res.json(person);
});

personsRouter.post('/', async (req, res) => {
  const person = await prisma.person.create({ data: req.body });
  await upsertVector('Person', person.id,
    `${person.firstName} ${person.lastName} ${person.address} ${person.city} ${person.zip}`);
  res.status(201).json(person);
});

personsRouter.put('/:id', async (req, res) => {
  const person = await prisma.person.update({ where: { id: req.params.id }, data: req.body });
  await upsertVector('Person', person.id,
    `${person.firstName} ${person.lastName} ${person.address} ${person.city} ${person.zip}`);
  res.json(person);
});

personsRouter.delete('/:id', async (req, res) => {
  await prisma.person.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
