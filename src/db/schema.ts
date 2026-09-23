import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Saved / Favorite properties linked to user's Firebase UID
export const savedProperties = pgTable(
  'saved_properties',
  {
    id: serial('id').primaryKey(),
    userUid: text('user_uid')
      .notNull()
      .references(() => users.uid, { onDelete: 'cascade' }),
    propertyId: text('property_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_property_idx').on(table.userUid, table.propertyId),
  ]
);

// Client Inquiries and consultation requests
export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid'),
  propertyRef: text('property_ref').notNull(),
  propertyTitle: text('property_title').notNull(),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  senderPhone: text('sender_phone'),
  message: text('message').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Search and luxury portfolio alerts
export const searchAlerts = pgTable('search_alerts', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid'),
  email: text('email').notNull(),
  destination: text('destination'),
  propertyType: text('property_type'),
  budgetMax: integer('budget_max'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedProperties: many(savedProperties),
  inquiries: many(inquiries),
  searchAlerts: many(searchAlerts),
}));

export const savedPropertiesRelations = relations(savedProperties, ({ one }) => ({
  user: one(users, {
    fields: [savedProperties.userUid],
    references: [users.uid],
  }),
}));
