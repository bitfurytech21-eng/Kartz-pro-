import { db } from './index.ts';
import { users, savedProperties, inquiries, searchAlerts } from './schema.ts';
import { eq, and, desc, count } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string, photoUrl?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(photoUrl ? { photoUrl } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}

export async function getUserSavedProperties(userUid: string) {
  try {
    const records = await db
      .select({
        propertyId: savedProperties.propertyId,
        createdAt: savedProperties.createdAt,
      })
      .from(savedProperties)
      .where(eq(savedProperties.userUid, userUid));
    return records.map((r) => r.propertyId);
  } catch (error) {
    console.error('Database getUserSavedProperties failed:', error);
    throw new Error('Failed to retrieve saved properties.', { cause: error });
  }
}

export async function addSavedProperty(userUid: string, propertyId: string) {
  try {
    const result = await db
      .insert(savedProperties)
      .values({
        userUid,
        propertyId,
      })
      .onConflictDoNothing()
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database addSavedProperty failed:', error);
    throw new Error('Failed to save property.', { cause: error });
  }
}

export async function removeSavedProperty(userUid: string, propertyId: string) {
  try {
    await db
      .delete(savedProperties)
      .where(
        and(
          eq(savedProperties.userUid, userUid),
          eq(savedProperties.propertyId, propertyId)
        )
      );
    return true;
  } catch (error) {
    console.error('Database removeSavedProperty failed:', error);
    throw new Error('Failed to remove saved property.', { cause: error });
  }
}

export async function createInquiryRecord(data: {
  userUid?: string;
  propertyRef: string;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}) {
  try {
    const result = await db
      .insert(inquiries)
      .values({
        userUid: data.userUid || null,
        propertyRef: data.propertyRef,
        propertyTitle: data.propertyTitle,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        senderPhone: data.senderPhone || null,
        message: data.message,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database createInquiryRecord failed:', error);
    throw new Error('Failed to record inquiry.', { cause: error });
  }
}

export async function createSearchAlertRecord(data: {
  userUid?: string;
  email: string;
  destination?: string;
  propertyType?: string;
  budgetMax?: number;
}) {
  try {
    const result = await db
      .insert(searchAlerts)
      .values({
        userUid: data.userUid || null,
        email: data.email,
        destination: data.destination || null,
        propertyType: data.propertyType || null,
        budgetMax: data.budgetMax || null,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database createSearchAlertRecord failed:', error);
    throw new Error('Failed to create search alert.', { cause: error });
  }
}

// ---------------------------------------------------------------------------
// Administrator Queries
// ---------------------------------------------------------------------------

export async function getAllInquiries() {
  try {
    return await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
  } catch (error) {
    console.error('Database getAllInquiries failed:', error);
    throw new Error('Failed to fetch inquiries.', { cause: error });
  }
}

export async function updateInquiryStatus(id: number, status: string) {
  try {
    const result = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database updateInquiryStatus failed:', error);
    throw new Error('Failed to update inquiry status.', { cause: error });
  }
}

export async function deleteInquiryRecord(id: number) {
  try {
    await db.delete(inquiries).where(eq(inquiries.id, id));
    return true;
  } catch (error) {
    console.error('Database deleteInquiryRecord failed:', error);
    throw new Error('Failed to delete inquiry.', { cause: error });
  }
}

export async function getAllSearchAlerts() {
  try {
    return await db
      .select()
      .from(searchAlerts)
      .orderBy(desc(searchAlerts.createdAt));
  } catch (error) {
    console.error('Database getAllSearchAlerts failed:', error);
    throw new Error('Failed to fetch search alerts.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    const userRecords = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    return userRecords;
  } catch (error) {
    console.error('Database getAllUsers failed:', error);
    throw new Error('Failed to fetch users.', { cause: error });
  }
}

export async function getAdminMetrics() {
  try {
    const [inquiriesList, alertsList, usersList, favoritesCount] = await Promise.all([
      db.select().from(inquiries),
      db.select().from(searchAlerts),
      db.select().from(users),
      db.select({ count: count() }).from(savedProperties),
    ]);

    const pendingInquiries = inquiriesList.filter((i) => i.status === 'pending').length;
    const contactedInquiries = inquiriesList.filter((i) => i.status === 'contacted').length;
    const scheduledInquiries = inquiriesList.filter((i) => i.status === 'viewing_scheduled').length;

    return {
      totalInquiries: inquiriesList.length,
      pendingInquiries,
      contactedInquiries,
      scheduledInquiries,
      totalAlerts: alertsList.length,
      totalClients: usersList.length,
      totalFavorites: Number(favoritesCount[0]?.count || 0),
    };
  } catch (error) {
    console.error('Database getAdminMetrics failed:', error);
    throw new Error('Failed to calculate admin metrics.', { cause: error });
  }
}

