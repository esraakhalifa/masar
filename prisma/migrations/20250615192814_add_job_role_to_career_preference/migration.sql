/*
  Warnings:

  - You are about to drop the column `preferences` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resume_text` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `assessments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_topics` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roadmap_id,title]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roadmap_id,title]` on the table `roadmap_topics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "course_topics" DROP CONSTRAINT "course_topics_course_id_fkey";

-- DropForeignKey
ALTER TABLE "course_topics" DROP CONSTRAINT "course_topics_topic_id_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "preferences",
DROP COLUMN "resume_text";

-- DropTable
DROP TABLE "assessments";

-- DropTable
DROP TABLE "course_topics";

-- CreateTable
CREATE TABLE "CareerPreference" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "preferredSalary" INTEGER NOT NULL,
    "workType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "job_role" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CareerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerPreference_userId_key" ON "CareerPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_roadmap_id_title_key" ON "Course"("roadmap_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_topics_roadmap_id_title_key" ON "roadmap_topics"("roadmap_id", "title");

-- AddForeignKey
ALTER TABLE "CareerPreference" ADD CONSTRAINT "CareerPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
