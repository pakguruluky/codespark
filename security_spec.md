# Security Specification — CodeSpark (Firestore Rules)

## 1. Data Invariants
1. **Identity & Email Verification**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
2. **Instructor Isolation**: Only verified Admins can create or delete `/instructors/{instructorId}`.
3. **Access Code Binding**: A student registration in `/students/{studentId}` MUST reference an existing, active `/access_codes/{codeId}` document (`exists()` + `isActive == true`).
4. **Student Ownership**: Students can only read/write their own `/students`, `/progress`, and `/certificates` records (`ownerUid == request.auth.uid`), while their assigned instructor (`instructorUid == request.auth.uid`) and Admin can view their progress/certificates.
5. **Immutable Audit & Certificates**: `createdAt`, `issuedAt`, `ownerUid`, `studentId`, `certificateNo`, and `tierId` are immutable after creation. Certificates are write-once (no client updates) to prevent tampering.
6. **Star & Code Bounds**: `progress.stars` must be an integer between `1` and `3`; `codeSubmitted` must be `1..4000` chars; all IDs must match `^[a-zA-Z0-9_\-]+$` and `<= 128` chars.
7. **Temporal Integrity**: Creation timestamps (`createdAt`, `completedAt`, `issuedAt`) must equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Student**: Adding `isAdmin: true` to a `/students/{id}` create payload. -> `PERMISSION_DENIED` (`hasOnly()`).
2. **Identity Spoofing on Progress**: Creating `/progress/{id}` with `ownerUid: "victim_uid"` while signed in as `"attacker_uid"`. -> `PERMISSION_DENIED`.
3. **Orphaned Student Registration**: Creating `/students/{id}` with `accessCode: "FAKE_CODE_999"` that does not exist in `/access_codes`. -> `PERMISSION_DENIED` (`exists()` check).
4. **Inactive Access Code Registration**: Creating `/students/{id}` using an existing access code whose `isActive == false`. -> `PERMISSION_DENIED`.
5. **Star Rating Poisoning**: Updating `/progress/{id}` with `stars: 99` or `stars: "three"`. -> `PERMISSION_DENIED` (`isValidProgress`).
6. **Resource Poisoning via Oversized ID**: Creating `/students/<200-char-junk>` or `/access_codes/bad$id!`. -> `PERMISSION_DENIED` (`isValidId`).
7. **Timestamp Forgery**: Creating `/certificates/{id}` with a backdated `issuedAt` instead of `request.time`. -> `PERMISSION_DENIED`.
8. **Certificate Tampering**: Attempting to update `studentName` or `tierName` on an issued `/certificates/{id}` as a student. -> `PERMISSION_DENIED` (terminal immutability).
9. **Unauthorized Instructor Creation**: Non-admin authenticated user attempting to create `/instructors/{id}`. -> `PERMISSION_DENIED`.
10. **PII / Credential Harvesting**: Non-admin user attempting to `get` or `list` another user's `/students/{otherId}` document. -> `PERMISSION_DENIED`.
11. **Unverified Email Admin Spoof**: Token claiming admin email with `email_verified: false`. -> `PERMISSION_DENIED`.
12. **Code Payload Flooding**: Submitting a 10,000-character string into `progress.codeSubmitted`. -> `PERMISSION_DENIED` (`size() <= 4000`).
