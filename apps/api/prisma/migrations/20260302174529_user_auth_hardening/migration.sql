-- Create enum for user status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
  END IF;
END$$;

-- Add columns (emailNorm added as nullable for backfill)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailNorm" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Backfill normalization
UPDATE "User" SET "emailNorm" = lower("email") WHERE "emailNorm" IS NULL;

-- Enforce not null + unique
ALTER TABLE "User" ALTER COLUMN "emailNorm" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'User_emailNorm_key'
  ) THEN
    CREATE UNIQUE INDEX "User_emailNorm_key" ON "User"("emailNorm");
  END IF;
END$$;
