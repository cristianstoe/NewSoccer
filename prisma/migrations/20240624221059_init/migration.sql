/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `League` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `games` to the `Statistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minutes` to the `Statistic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "code" TEXT,
ADD COLUMN     "flag" TEXT;

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "logo" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "position" TEXT;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "current" BOOLEAN NOT NULL,
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Statistic" ADD COLUMN     "games" INTEGER NOT NULL,
ADD COLUMN     "minutes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "logo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");
