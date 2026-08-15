import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../src/lib/mongodb.js';
import { isAuthorizedAdminRequest } from '../../src/lib/auth.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorizedAdminRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication required.' });
  }

  const { method } = req;
  const { id } = req.query;

  try {
    const { db } = await connectToDatabase();
    const companiesCol = db.collection('companies');
    const eventsCol = db.collection('events');

    // ----------------------------------------------------------------------
    // POST: Create New Company & Events
    // ----------------------------------------------------------------------
    if (method === 'POST') {
      const { company, events } = req.body || {};
      const compData = company || req.body;

      if (!compData || !compData.companyName || !compData.companyName.trim()) {
        return res.status(400).json({ error: 'Company name is required' });
      }

      let parsedRoles: Array<{ roleName: string; ctc: string }> = [];

      if (Array.isArray(compData.roles) && compData.roles.length > 0) {
        for (let i = 0; i < compData.roles.length; i++) {
          const r = compData.roles[i];
          if (!r || !r.roleName || !r.roleName.trim()) {
            return res.status(400).json({ error: `Role name is required for role #${i + 1}.` });
          }
          if (!r || !r.ctc || !r.ctc.trim()) {
            return res.status(400).json({ error: `CTC is required for role #${i + 1}.` });
          }
          parsedRoles.push({
            roleName: r.roleName.trim(),
            ctc: r.ctc.trim(),
          });
        }
      } else if (compData.roleOffered || compData.package) {
        parsedRoles = [
          {
            roleName: compData.roleOffered?.trim() || 'Software Engineer',
            ctc: compData.package?.trim() || 'N/A',
          },
        ];
      }

      if (parsedRoles.length === 0) {
        return res.status(400).json({ error: 'At least one role with role name and CTC is required.' });
      }

      const nowIso = new Date().toISOString();
      const companyId = compData.companyId || `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const companyDoc = {
        companyId,
        companyName: compData.companyName.trim(),
        roles: parsedRoles,
        roleOffered: parsedRoles[0]?.roleName,
        package: parsedRoles[0]?.ctc,
        logoUrl: compData.logoUrl?.trim() || undefined,
        location: compData.location?.trim() || 'Bangalore',
        description: compData.description?.trim() || '',
        registrationUrl: compData.registrationUrl?.trim() || undefined,
        createdAt: compData.createdAt || nowIso,
        updatedAt: nowIso,
      };

      const result = await companiesCol.insertOne(companyDoc);
      const insertedCompanyId = companyId;

      let insertedEvents: any[] = [];
      if (Array.isArray(events) && events.length > 0) {
        const eventDocs = events.map((e: any, idx: number) => ({
          eventId: e.eventId || `evt-${insertedCompanyId}-${idx + 1}-${Date.now()}`,
          companyId: insertedCompanyId,
          eventType: e.eventType || 'COMPANY_REGISTRATION',
          title: e.title || 'Event',
          date: e.date,
          time: e.time,
          dateTime: e.dateTime,
          url: e.url || undefined,
          description: e.description || undefined,
          createdAt: nowIso,
          updatedAt: nowIso,
        }));

        const evResult = await eventsCol.insertMany(eventDocs);
        insertedEvents = eventDocs.map((ev, i) => ({
          ...ev,
          _id: evResult.insertedIds[i]?.toString(),
        }));
      }

      return res.status(201).json({
        success: true,
        company: {
          ...companyDoc,
          _id: result.insertedId.toString(),
          events: insertedEvents,
        },
      });
    }

    // ----------------------------------------------------------------------
    // PUT: Update Company & Refresh Events
    // ----------------------------------------------------------------------
    if (method === 'PUT') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Company ID is required for update' });
      }

      const { company, events } = req.body || {};
      const companyData = company || req.body;

      if (!companyData || !companyData.companyName || !companyData.companyName.trim()) {
        return res.status(400).json({ error: 'Company name is required' });
      }

      let parsedRoles: Array<{ roleName: string; ctc: string }> = [];

      if (Array.isArray(companyData.roles) && companyData.roles.length > 0) {
        for (let i = 0; i < companyData.roles.length; i++) {
          const r = companyData.roles[i];
          if (!r || !r.roleName || !r.roleName.trim()) {
            return res.status(400).json({ error: `Role name is required for role #${i + 1}.` });
          }
          if (!r || !r.ctc || !r.ctc.trim()) {
            return res.status(400).json({ error: `CTC is required for role #${i + 1}.` });
          }
          parsedRoles.push({
            roleName: r.roleName.trim(),
            ctc: r.ctc.trim(),
          });
        }
      } else if (companyData.roleOffered || companyData.package) {
        parsedRoles = [
          {
            roleName: companyData.roleOffered?.trim() || 'Software Engineer',
            ctc: companyData.package?.trim() || 'N/A',
          },
        ];
      }

      if (parsedRoles.length === 0) {
        return res.status(400).json({ error: 'At least one role with role name and CTC is required.' });
      }

      const nowIso = new Date().toISOString();

      const updateFields: any = {
        companyName: companyData.companyName.trim(),
        roles: parsedRoles,
        roleOffered: parsedRoles[0]?.roleName,
        package: parsedRoles[0]?.ctc,
        location: companyData.location?.trim() || 'Bangalore',
        description: companyData.description?.trim() || '',
        logoUrl: companyData.logoUrl?.trim() || undefined,
        registrationUrl: companyData.registrationUrl?.trim() || undefined,
        updatedAt: nowIso,
      };

      let targetQuery: any = { companyId: id };
      if (ObjectId.isValid(id)) {
        targetQuery = { $or: [{ companyId: id }, { _id: new ObjectId(id) }] };
      }

      const updateResult = await companiesCol.updateOne(targetQuery, { $set: updateFields });

      if (Array.isArray(events)) {
        await eventsCol.deleteMany({ $or: [{ companyId: id }] });

        if (events.length > 0) {
          const eventDocs = events.map((e: any, idx: number) => ({
            eventId: e.eventId || `evt-${id}-${idx + 1}-${Date.now()}`,
            companyId: id,
            eventType: e.eventType,
            title: e.title || 'Event',
            date: e.date,
            time: e.time,
            dateTime: e.dateTime,
            url: e.url || undefined,
            description: e.description || undefined,
            createdAt: e.createdAt || nowIso,
            updatedAt: nowIso,
          }));

          await eventsCol.insertMany(eventDocs);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Company updated successfully',
      });
    }

    // ----------------------------------------------------------------------
    // DELETE: Delete Company & Cascade Delete Associated Events
    // ----------------------------------------------------------------------
    if (method === 'DELETE') {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Company ID is required for deletion' });
      }

      let targetQuery: any = { companyId: id };
      if (ObjectId.isValid(id)) {
        targetQuery = { $or: [{ companyId: id }, { _id: new ObjectId(id) }] };
      }

      const companyToDelete = await companiesCol.findOne(targetQuery);
      const companyIdStr = companyToDelete?.companyId || id;
      const mongoObjIdStr = companyToDelete?._id ? companyToDelete._id.toString() : id;

      const delCompanyResult = await companiesCol.deleteOne(targetQuery);
      const delEventsResult = await eventsCol.deleteMany({
        $or: [{ companyId: id }, { companyId: companyIdStr }, { companyId: mongoObjIdStr }],
      });

      return res.status(200).json({
        success: true,
        message: `Deleted company and ${delEventsResult.deletedCount} associated events.`,
        deletedCount: delCompanyResult.deletedCount,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error';
    return res.status(500).json({ error: 'Admin API operation failed', details: message });
  }
}
