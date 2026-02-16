-- CreateTable
CREATE TABLE "CounterRecord" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CounterRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CounterRecord" ADD CONSTRAINT "CounterRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
