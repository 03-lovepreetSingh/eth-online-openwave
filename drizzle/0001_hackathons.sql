CREATE TABLE "hackathons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(256) NOT NULL,
  "description" text,
  "start_date" timestamptz NOT NULL,
  "end_date" timestamptz NOT NULL,
  "image_url" varchar(256),
  "status" varchar(50) DEFAULT 'upcoming',
  "created_at" timestamptz DEFAULT now(),
  "created_by" varchar(256) REFERENCES users(id)
);