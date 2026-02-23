-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "isSetup" BOOLEAN NOT NULL DEFAULT false,
    "startWeightKg" REAL NOT NULL DEFAULT 70,
    "currentWeightKg" REAL NOT NULL DEFAULT 70,
    "targetWeightKg" REAL NOT NULL DEFAULT 60,
    "targetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetCalories" REAL NOT NULL DEFAULT 1500,
    "heightCm" REAL NOT NULL DEFAULT 165,
    "gender" TEXT NOT NULL DEFAULT 'prefer_not_to_say',
    "ageYears" INTEGER NOT NULL DEFAULT 25,
    "activityLevel" TEXT NOT NULL DEFAULT 'moderate',
    "weeklyGoalKg" REAL NOT NULL DEFAULT 0.5,
    "weighInReminderDays" INTEGER NOT NULL DEFAULT 3,
    "noMealReminderTime" TEXT NOT NULL DEFAULT '21:00',
    "includeWorkoutInBudget" BOOLEAN NOT NULL DEFAULT true,
    "unitPreference" TEXT NOT NULL DEFAULT 'kg',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("id", "includeWorkoutInBudget", "noMealReminderTime", "startWeightKg", "targetCalories", "targetDate", "targetWeightKg", "unitPreference", "updatedAt", "weeklyGoalKg", "weighInReminderDays") SELECT "id", "includeWorkoutInBudget", "noMealReminderTime", "startWeightKg", "targetCalories", "targetDate", "targetWeightKg", "unitPreference", "updatedAt", "weeklyGoalKg", "weighInReminderDays" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
