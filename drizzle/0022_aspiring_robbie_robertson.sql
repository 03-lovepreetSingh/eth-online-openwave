CREATE TABLE "maintainerWallet_transactions" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256),
	"amount" numeric(36, 18) NOT NULL,
	"transactionType" varchar(256) NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintainerWallet" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"maintainerWalletBalance" numeric(36, 18) NOT NULL
);
