CREATE TABLE "project_votes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid REFERENCES hack_projects(id),
  "voter_id" varchar(256) REFERENCES users(id),
  "vote_type" varchar(50) NOT NULL,
  "vote_weight" int DEFAULT 1,
  "created_at" timestamptz DEFAULT now(),
  UNIQUE(project_id, voter_id)
);