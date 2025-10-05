CREATE TABLE "project_split_payments" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(256),
	"total_amount" varchar(256) NOT NULL,
	"contributor_share" varchar(256) NOT NULL,
	"maintainer_share" varchar(256) NOT NULL,
	"transaction_hash" varchar(256),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "project_split_payments" ADD CONSTRAINT "project_split_payments_project_id_hack_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."hack_projects"("id") ON DELETE no action ON UPDATE no action;