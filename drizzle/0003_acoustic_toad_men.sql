ALTER TABLE "reviews" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_review" ON "reviews" USING btree ("book_id","user_id");