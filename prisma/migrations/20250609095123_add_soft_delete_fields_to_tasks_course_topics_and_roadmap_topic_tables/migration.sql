-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "course_topics" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "roadmap_topics" ADD COLUMN     "deleted_at" TIMESTAMP(3);
