CREATE TABLE "hack_projects" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" varchar(256),
	"project_name" varchar(256) NOT NULL,
	"description" text,
	"repository" varchar(256),
	"image_url" varchar(256),
	"owner_id" varchar(256),
	"team_members" jsonb,
	"tech_stack" jsonb,
	"contract_address" varchar(256),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"image_url" varchar(256),
	"status" varchar(50) DEFAULT 'upcoming',
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "project_votes" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(256),
	"voter_id" varchar(256),
	"vote_type" varchar(50) NOT NULL,
	"vote_weight" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "project_votes_project_voter_unique_idx" UNIQUE("project_id","voter_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"owner" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hack_projects" ADD CONSTRAINT "hack_projects_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hack_projects" ADD CONSTRAINT "hack_projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_votes" ADD CONSTRAINT "project_votes_project_id_hack_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."hack_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_votes" ADD CONSTRAINT "project_votes_voter_id_users_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;