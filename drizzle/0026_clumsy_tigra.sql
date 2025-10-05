CREATE TABLE "project_certificates" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(256),
	"ipfs_hash" text NOT NULL,
	"url" text,
	"issued_at" timestamp DEFAULT now(),
	"issued_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_certificates" ADD CONSTRAINT "project_certificates_project_id_hack_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."hack_projects"("id") ON DELETE no action ON UPDATE no action;