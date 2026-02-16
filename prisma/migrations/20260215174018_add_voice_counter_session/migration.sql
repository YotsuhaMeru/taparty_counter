-- CreateTable
CREATE TABLE "VoiceCounterSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "counts" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "VoiceCounterSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoiceCounterSession" ADD CONSTRAINT "VoiceCounterSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
