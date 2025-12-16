ALTER TABLE "collection_categories" ADD COLUMN "creator_id_id" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "creator_id_id" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "creator_id_id" text;--> statement-breakpoint
ALTER TABLE "collection_categories" ADD CONSTRAINT "collection_categories_creator_id_id_users_id_fk" FOREIGN KEY ("creator_id_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_creator_id_id_users_id_fk" FOREIGN KEY ("creator_id_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_creator_id_id_users_id_fk" FOREIGN KEY ("creator_id_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;