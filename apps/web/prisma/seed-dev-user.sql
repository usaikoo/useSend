-- Seed local dev admin user for email/password login
-- Usage: psql "$DATABASE_URL" -f apps/web/prisma/seed-dev-user.sql
--
-- Login: test@rioreply.app / Montreal123@

BEGIN;

INSERT INTO "User" (
  "email",
  "name",
  "emailVerified",
  "passwordHash",
  "isBetaUser",
  "isWaitlisted",
  "createdAt"
)
VALUES (
  'test@rioreply.app',
  'RioReply Test Admin',
  NOW(),
  '$2b$12$Ihx4ogW54/kSZhV5OTouDujC0kXrrUAtywPAuaVBrAuBjtAvrpUm6',
  TRUE,
  FALSE,
  NOW()
)
ON CONFLICT ("email") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "emailVerified" = EXCLUDED."emailVerified",
  "passwordHash" = EXCLUDED."passwordHash",
  "isBetaUser" = EXCLUDED."isBetaUser",
  "isWaitlisted" = EXCLUDED."isWaitlisted";

DO $$
DECLARE
  v_user_id INT;
  v_team_id INT;
BEGIN
  SELECT id INTO v_user_id
  FROM "User"
  WHERE "email" = 'test@rioreply.app';

  SELECT tu."teamId" INTO v_team_id
  FROM "TeamUser" tu
  WHERE tu."userId" = v_user_id
  LIMIT 1;

  IF v_team_id IS NULL THEN
    INSERT INTO "Team" ("name", "plan", "isActive", "apiRateLimit", "createdAt", "updatedAt")
    VALUES ('RioReply Test', 'FREE'::"Plan", TRUE, 10, NOW(), NOW())
    RETURNING id INTO v_team_id;

    INSERT INTO "TeamUser" ("teamId", "userId", "role")
    VALUES (v_team_id, v_user_id, 'ADMIN'::"Role")
    ON CONFLICT ("teamId", "userId") DO UPDATE
    SET "role" = 'ADMIN'::"Role";
  ELSE
    UPDATE "TeamUser"
    SET "role" = 'ADMIN'::"Role"
    WHERE "teamId" = v_team_id AND "userId" = v_user_id;
  END IF;
END $$;

COMMIT;
