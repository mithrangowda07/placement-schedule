import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../src/lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Company ID query parameter is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const companyCol = db.collection('companies');
    const eventCol = db.collection('events');

    let company = await companyCol.findOne({ companyId: id });
    if (!company && ObjectId.isValid(id)) {
      company = await companyCol.findOne({ _id: new ObjectId(id) });
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const compId = company.companyId || company._id.toString();
    const events = await eventCol
      .find({ $or: [{ companyId: compId }, { companyId: company._id.toString() }] })
      .sort({ dateTime: 1 })
      .toArray();

    const roles =
      Array.isArray(company.roles) && company.roles.length > 0
        ? company.roles
        : company.roleOffered || company.package
        ? [{ roleName: company.roleOffered || 'Software Engineer', ctc: company.package || 'N/A' }]
        : [];

    const formattedCompany = {
      ...company,
      roles,
      _id: company._id.toString(),
      companyId: compId,
    };

    const formattedEvents = events.map((e) => ({
      ...e,
      _id: e._id.toString(),
      eventId: e.eventId || e._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      company: formattedCompany,
      events: formattedEvents,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error';
    return res.status(500).json({ error: 'Failed to fetch company details', details: message });
  }
}
