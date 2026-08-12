import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../src/lib/mongodb';
import { INITIAL_COMPANIES, INITIAL_EVENTS } from '../src/services/seedData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const companiesCol = db.collection('companies');
    const eventsCol = db.collection('events');

    let companies = await companiesCol.find({}).toArray();
    let events = await eventsCol.find({}).toArray();

    // Auto-populate MongoDB Atlas if the collections are empty
    if (companies.length === 0) {
      await companiesCol.insertMany(INITIAL_COMPANIES as any);
      await eventsCol.insertMany(INITIAL_EVENTS as any);
      companies = await companiesCol.find({}).toArray();
      events = await eventsCol.find({}).toArray();
    }

    const formattedCompanies = companies.map((c) => ({
      ...c,
      _id: c._id.toString(),
      companyId: c.companyId || c._id.toString(),
    }));

    const formattedEvents = events.map((e) => ({
      ...e,
      _id: e._id.toString(),
      eventId: e.eventId || e._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      companies: formattedCompanies,
      events: formattedEvents,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error';
    return res.status(500).json({ error: 'Failed to fetch placement companies', details: message });
  }
}
