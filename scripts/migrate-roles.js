/**
 * Database Migration Script for RVCE Placement Hub
 * Converts legacy companies with `roleOffered` / `package` fields into the new `roles: [{ roleName, ctc }]` structure.
 * 
 * Usage:
 * node scripts/migrate-roles.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement';
const DB_NAME = process.env.MONGODB_DB || 'placement';

async function migrateRoles() {
  console.log('Starting MongoDB company roles migration...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB database.');
    const db = client.db(DB_NAME);
    const companiesCol = db.collection('companies');

    const companies = await companiesCol.find({}).toArray();
    console.log(`Found ${companies.length} company records to evaluate.`);

    let updatedCount = 0;

    for (const comp of companies) {
      if (!Array.isArray(comp.roles) || comp.roles.length === 0) {
        const legacyRole = comp.roleOffered || comp.role || 'Software Engineer';
        const legacyPackage = comp.package || 'N/A';

        const roles = [
          {
            roleName: legacyRole,
            ctc: legacyPackage,
          },
        ];

        await companiesCol.updateOne(
          { _id: comp._id },
          {
            $set: {
              roles,
              roleOffered: legacyRole,
              package: legacyPackage,
              updatedAt: new Date().toISOString(),
            },
          }
        );
        updatedCount++;
        console.log(`Migrated company: "${comp.companyName}" -> roles:`, roles);
      }
    }

    console.log(`Migration completed successfully. Updated ${updatedCount} companies.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateRoles();
