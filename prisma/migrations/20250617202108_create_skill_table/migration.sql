/*
  Warnings:

  - You are about to drop the column `user_id` on the `VerificationToken` table. All the data in the column will be lost.
  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "VerificationToken" DROP CONSTRAINT "VerificationToken_user_id_fkey";

-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
