CREATE TABLE "hack_projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "hackathon_id" uuid REFERENCES hackathons(id),
  "project_name" varchar(256) NOT NULL,
  "description" text,
  "repository" varchar(256),
  "image_url" varchar(256),
  "owner_id" varchar(256) REFERENCES users(id),
  "team_members" jsonb,
  "tech_stack" jsonb,
  "contract_address" varchar(256),
  "created_at" timestamptz DEFAULT now()
);