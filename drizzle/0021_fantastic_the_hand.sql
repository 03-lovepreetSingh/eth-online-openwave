CREATE TABLE "maintainerWallet_transactions" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256),
	"amount" numeric(36, 18) NOT NULL,
	"transactionType" varchar(256) NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contributorApplications" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"projectName" varchar(256),
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"bio" text,
	"whyContribute" text,
	"exampleProjects" text,
	"languages" json,
	"frameworks" json,
	"tools" json,
	"otherSkills" text,
	"experienceMatrix" json,
	"resumeUrl" varchar(512),
	"samplePatchesUrl" varchar(512),
	"sshPublicKey" text,
	"prLinks" text,
	"accessLevel" varchar(100),
	"ndaAgreement" boolean DEFAULT false,
	"twoFactorEnabled" boolean DEFAULT false,
	"earliestStartDate" varchar(50),
	"codeOfConductAgreed" boolean DEFAULT false,
	"contributionGuidelinesAgreed" boolean DEFAULT false,
	"fullName" varchar(256),
	"signatureDate" varchar(50),
	"status" varchar(50) DEFAULT 'pending',
	"submittedAt" timestamp DEFAULT now(),
	CONSTRAINT "contributorApplications_username_projectName_unique" UNIQUE("username","projectName")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectName" varchar(256),
	"userId" varchar(256),
	"likedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintainerWallet" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"maintainerWalletBalance" numeric(36, 18) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payments" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256),
	"amount" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_embeddings" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"languages" text,
	"owner" varchar(256),
	"embedding" vector(384) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"walletBalance" numeric(36, 18) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256),
	"amount" numeric(36, 18) NOT NULL,
	"transactionType" varchar(256) NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "PullRequests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assignIssues" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "completedIssues" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pendingReview" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "PullRequests" CASCADE;--> statement-breakpoint
DROP TABLE "assignIssues" CASCADE;--> statement-breakpoint
DROP TABLE "completedIssues" CASCADE;--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "participants" CASCADE;--> statement-breakpoint
DROP TABLE "pendingReview" CASCADE;--> statement-breakpoint
DROP TABLE "projects" CASCADE;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "issue_id" varchar(256);--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "Contributor Name" varchar(256);--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "Contributor_id" varchar(256);--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "withdrawn" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contributorRequests" ADD COLUMN "Full Name (User)" varchar(256);--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "issue_url" varchar(256);--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "maintainerUserIds" json;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "type" varchar(256);--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "Tag" varchar(256);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "contributorContract" varchar(256);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "maintainerrWallet" varchar(256);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "formFilled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "termsAccepted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "rewards" DROP COLUMN "Contributor";--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN "likes";--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN "language";--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_issue_url_unique" UNIQUE("issue_url");