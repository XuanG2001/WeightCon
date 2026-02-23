-- CreateTable
CREATE TABLE "Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateTime" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "descriptionText" TEXT NOT NULL,
    "photoPaths" TEXT NOT NULL DEFAULT '[]',
    "aiSummary" TEXT NOT NULL DEFAULT '',
    "caloriesMin" REAL NOT NULL DEFAULT 0,
    "caloriesMax" REAL NOT NULL DEFAULT 0,
    "caloriesMid" REAL NOT NULL DEFAULT 0,
    "proteinMin" REAL NOT NULL DEFAULT 0,
    "proteinMax" REAL NOT NULL DEFAULT 0,
    "proteinMid" REAL NOT NULL DEFAULT 0,
    "carbsMin" REAL NOT NULL DEFAULT 0,
    "carbsMax" REAL NOT NULL DEFAULT 0,
    "carbsMid" REAL NOT NULL DEFAULT 0,
    "fatMin" REAL NOT NULL DEFAULT 0,
    "fatMax" REAL NOT NULL DEFAULT 0,
    "fatMid" REAL NOT NULL DEFAULT 0,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "portionAdjust" TEXT NOT NULL DEFAULT 'normal',
    "oilAdjust" TEXT NOT NULL DEFAULT 'unknown',
    "notes" TEXT NOT NULL DEFAULT '[]',
    "isFrequent" BOOLEAN NOT NULL DEFAULT false,
    "revisedFromMealId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateTime" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "durationMin" REAL,
    "intensity" TEXT,
    "calories" REAL NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'estimate',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "weightKg" REAL NOT NULL,
    "weightJinRaw" REAL,
    "isPeriod" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "startWeightKg" REAL NOT NULL DEFAULT 100,
    "targetWeightKg" REAL NOT NULL DEFAULT 80,
    "targetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetCalories" REAL NOT NULL DEFAULT 1500,
    "weighInReminderDays" INTEGER NOT NULL DEFAULT 3,
    "noMealReminderTime" TEXT NOT NULL DEFAULT '21:00',
    "includeWorkoutInBudget" BOOLEAN NOT NULL DEFAULT true,
    "unitPreference" TEXT NOT NULL DEFAULT 'kg',
    "weeklyGoalKg" REAL NOT NULL DEFAULT 0.8,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WeightEntry_date_key" ON "WeightEntry"("date");
