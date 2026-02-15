-- CreateTable
CREATE TABLE "PendingUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "currentChallenge" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_username_key" ON "PendingUser"("username");
