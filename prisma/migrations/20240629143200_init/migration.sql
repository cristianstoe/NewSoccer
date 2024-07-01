-- CreateTable
CREATE TABLE "Fixture" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "referee" TEXT,
    "timezone" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "elapsed" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "goalsHome" INTEGER,
    "goalsAway" INTEGER,
    "halftimeHome" INTEGER,
    "halftimeAway" INTEGER,
    "fulltimeHome" INTEGER,
    "fulltimeAway" INTEGER,
    "extratimeHome" INTEGER,
    "extratimeAway" INTEGER,
    "penaltyHome" INTEGER,
    "penaltyAway" INTEGER,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fixture_fixtureId_key" ON "Fixture"("fixtureId");

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Stadium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
