-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "presetPrices" JSONB,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
