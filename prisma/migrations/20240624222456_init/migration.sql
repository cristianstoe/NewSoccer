/*
  Warnings:

  - You are about to drop the column `coachId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `Coach` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[year]` on the table `Season` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Stadium` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Made the column `age` on table `Player` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nationality` on table `Player` required. This step will fail if there are existing NULL values in that column.
  - Made the column `position` on table `Player` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_coachId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_stadiumId_fkey";

-- DropIndex
DROP INDEX "Team_coachId_key";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "age" SET NOT NULL,
ALTER COLUMN "nationality" SET NOT NULL,
ALTER COLUMN "position" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "coachId",
DROP COLUMN "seasonId",
ALTER COLUMN "stadiumId" DROP NOT NULL;

-- DropTable
DROP TABLE "Coach";

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Stadium_name_key" ON "Stadium"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE SET NULL ON UPDATE CASCADE;
