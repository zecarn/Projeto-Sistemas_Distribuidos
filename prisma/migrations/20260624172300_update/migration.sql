-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'RETURNED');

-- Preserve Author data while adapting the column name.
ALTER TABLE "Author" RENAME COLUMN "biography" TO "bio";
DROP INDEX "Author_name_key";

-- Add the new Book fields as nullable while existing rows are migrated.
ALTER TABLE "Book"
ADD COLUMN "authorId" INTEGER,
ADD COLUMN "description" TEXT,
ADD COLUMN "publishedYear" INTEGER;

UPDATE "Book"
SET "publishedYear" = EXTRACT(YEAR FROM "publishedAt")::INTEGER
WHERE "publishedAt" IS NOT NULL;

-- The former model allowed several authors. The lowest linked author ID becomes
-- the principal author in the new 1:N model.
UPDATE "Book" AS book
SET "authorId" = links."authorId"
FROM (
    SELECT "B" AS "bookId", MIN("A") AS "authorId"
    FROM "_AuthorToBook"
    GROUP BY "B"
) AS links
WHERE book."id" = links."bookId";

-- Keep orphan books valid under the new required relationship.
INSERT INTO "Author" ("name", "bio", "createdAt", "updatedAt")
SELECT 'Autor desconhecido', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Book" WHERE "authorId" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "Author" WHERE "name" = 'Autor desconhecido');

UPDATE "Book"
SET "authorId" = (
    SELECT "id" FROM "Author"
    WHERE "name" = 'Autor desconhecido'
    ORDER BY "id"
    LIMIT 1
)
WHERE "authorId" IS NULL;

ALTER TABLE "Book" ALTER COLUMN "authorId" SET NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookCategory" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "BookCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- Convert the former Book N:1 Category relation into the explicit N:M table.
INSERT INTO "BookCategory" ("bookId", "categoryId")
SELECT "id", "categoryId" FROM "Book";

-- Remove the former relationships only after their data has been copied.
ALTER TABLE "Book" DROP CONSTRAINT "Book_categoryId_fkey";
ALTER TABLE "_AuthorToBook" DROP CONSTRAINT "_AuthorToBook_A_fkey";
ALTER TABLE "_AuthorToBook" DROP CONSTRAINT "_AuthorToBook_B_fkey";

DROP INDEX "Book_categoryId_idx";
DROP INDEX "Book_isbn_key";

ALTER TABLE "Book"
DROP COLUMN "categoryId",
DROP COLUMN "isbn",
DROP COLUMN "publishedAt";

DROP TABLE "_AuthorToBook";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "BookCategory_bookId_idx" ON "BookCategory"("bookId");
CREATE INDEX "BookCategory_categoryId_idx" ON "BookCategory"("categoryId");
CREATE UNIQUE INDEX "BookCategory_bookId_categoryId_key" ON "BookCategory"("bookId", "categoryId");
CREATE INDEX "Loan_userId_idx" ON "Loan"("userId");
CREATE INDEX "Loan_bookId_idx" ON "Loan"("bookId");
CREATE INDEX "Loan_status_idx" ON "Loan"("status");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookCategory" ADD CONSTRAINT "BookCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
