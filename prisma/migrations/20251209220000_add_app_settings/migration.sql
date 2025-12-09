CREATE TABLE "AppSettings" (
    "isTutorialOn" BOOLEAN NOT NULL DEFAULT false
);CREATE UNIQUE INDEX "AppSettings_isTutorialOn_key" ON "AppSettings"("isTutorialOn");
