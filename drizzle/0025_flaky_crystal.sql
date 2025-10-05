CREATE TABLE "hackathon_results" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hackathon_id" varchar(256),
	"project_id" varchar(256),
	"final_rank" integer,
	"total_votes" integer DEFAULT 0,
	"yes_votes" integer DEFAULT 0,
	"no_votes" integer DEFAULT 0,
	"approval_percentage" numeric(5, 2),
	"voting_status" varchar(50) DEFAULT 'pending',
	"total_funding" numeric(36, 18) DEFAULT '0',
	"contributors_funding" numeric(36, 18) DEFAULT '0',
	"maintainers_funding" numeric(36, 18) DEFAULT '0',
	"award_category" varchar(100),
	"judge_feedback" text,
	"demo_url" varchar(512),
	"presentation_url" varchar(512),
	"final_score" numeric(5, 2),
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hackathon_results_hackathon_project_unique" UNIQUE("hackathon_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "hackathon_results" ADD CONSTRAINT "hackathon_results_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_results" ADD CONSTRAINT "hackathon_results_project_id_hack_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."hack_projects"("id") ON DELETE no action ON UPDATE no action;