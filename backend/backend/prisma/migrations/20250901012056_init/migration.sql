/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `sourceApp` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `feedback` table. All the data in the column will be lost.
  - The `status` column on the `feedback` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `feedback_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedback_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedback_processing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_logs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[feedbackNo]` on the table `feedback` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `feedbackNo` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `feedback` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_attachments" DROP CONSTRAINT "feedback_attachments_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_processing" DROP CONSTRAINT "feedback_processing_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_processing" DROP CONSTRAINT "feedback_processing_processorId_fkey";

-- DropForeignKey
ALTER TABLE "system_logs" DROP CONSTRAINT "system_logs_userId_fkey";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "audioUrl",
DROP COLUMN "categoryId",
DROP COLUMN "priority",
DROP COLUMN "sourceApp",
DROP COLUMN "sourceUrl",
DROP COLUMN "textContent",
DROP COLUMN "title",
DROP COLUMN "userId",
ADD COLUMN     "externalSystemId" TEXT,
ADD COLUMN     "feedbackNo" TEXT NOT NULL,
ADD COLUMN     "reply" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "feedback_attachments";

-- DropTable
DROP TABLE "feedback_categories";

-- DropTable
DROP TABLE "feedback_processing";

-- DropTable
DROP TABLE "system_logs";

-- DropEnum
DROP TYPE "FeedbackPriority";

-- DropEnum
DROP TYPE "FeedbackStatus";

-- DropEnum
DROP TYPE "FeedbackType";

-- DropEnum
DROP TYPE "ProcessingAction";

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_logs" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "operator" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalSystemId" TEXT NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT[],
    "rateLimit" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_call_logs" (
    "id" TEXT NOT NULL,
    "externalSystemId" TEXT NOT NULL,
    "apiPath" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "requestTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTime" INTEGER,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "api_call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "external_systems_name_key" ON "external_systems"("name");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_feedbackNo_key" ON "feedback"("feedbackNo");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_externalSystemId_fkey" FOREIGN KEY ("externalSystemId") REFERENCES "external_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_logs" ADD CONSTRAINT "operation_logs_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_externalSystemId_fkey" FOREIGN KEY ("externalSystemId") REFERENCES "external_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_call_logs" ADD CONSTRAINT "api_call_logs_externalSystemId_fkey" FOREIGN KEY ("externalSystemId") REFERENCES "external_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
