# Firestore Security Specification

## 1. Data Invariants
- **Identity Invariant**: Users may only read and write their own profile (`/users/{userId}`) and their own sub-collections (`/users/{userId}/favorites/{propertyId}`). `userId` must match `request.auth.uid`.
- **Integrity Invariant**: Creation of inquiries, alerts, and valuations must conform strictly to schema bounds (email format, string lengths <= 254/2000 chars, no ghost fields).
- **Admin Invariant**: Direct list access to client inquiries and owner valuations is restricted to verified administrators (`isAdmin()` or owner `userId`).
- **Connection Test Invariant**: `/test/{testId}` documents permit read access for connection validation and health telemetry.
- **Default Deny Invariant**: Catch-all default deny on all unmatched paths.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated User Profile Write**: Attempting to write `/users/user_abc` without an active auth token.
2. **Identity Spoofing Profile**: User `uid_123` attempting to write to `/users/uid_999`.
3. **Ghost Field Injection**: Attempting to set `isAdmin: true` or `role: 'admin'` on `/users/{userId}`.
4. **Denial of Wallet ID**: Attempting to create an alert with an ID longer than 128 characters or containing illegal symbols.
5. **PII Blanket Read**: Authenticated user `uid_123` attempting to list all documents in `/inquiries` without admin role.
6. **Payload Size Poisoning**: Submitting an inquiry with a message exceeding 2000 characters.
7. **Foreign Favorite Write**: User `uid_123` attempting to write to `/users/uid_999/favorites/prop_01`.
8. **Valuation Status Tampering**: Non-admin attempting to mark a valuation request as `reviewed` or `archived`.
9. **Email Spoofing**: Attempting to impersonate admin using an unverified email token.
10. **Unchecked List Scraping**: Querying `/alerts` without ownership filters.
11. **Orphaned Write**: Creating a favorite with an invalid propertyId or mismatched user owner.
12. **Catch-All Probe**: Attempting arbitrary read/write on `/system_secrets` or undeclared collection paths.
