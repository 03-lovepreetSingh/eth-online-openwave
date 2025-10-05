CREATE TABLE "project_split_payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid REFERENCES hack_projects(id),
  "total_amount" varchar(256) NOT NULL,
  "contributor_share" varchar(256) NOT NULL,
  "maintainer_share" varchar(256) NOT NULL,
  "transaction_hash" varchar(256),
  "status" varchar(50) DEFAULT 'pending',
  "created_at" timestamptz DEFAULT now()
);