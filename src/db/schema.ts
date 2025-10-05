import {
  pgTable,
  json,
  text,
  varchar,
  timestamp,
  integer,
  unique,
  doublePrecision,
  boolean,
  numeric,
  decimal,
  vector,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { Tag } from "lucide-react";

// Users Table
export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  fullName: text("full_name"),
  image_url: varchar("image_url", { length: 256 }),
  metaMask: varchar("MetaMask Wallet Address", { length: 256 }),
  email: varchar("email", { length: 256 }),
  Location: varchar("Location", { length: 256 }),
  Bio: text("Bio"),
  contributorContract: varchar("contributorContract", { length: 256 }),
  maintainerWallet: varchar("maintainerrWallet", { length: 256 }),
  Telegram: varchar("Telegram", { length: 256 }),
  Twitter: varchar("Twitter", { length: 256 }),
  Linkedin: varchar("Linkedin", { length: 256 }),
  rating: integer("rating").default(5),
  skills: json("skills"),
  formFilled: boolean("formFilled").default(false),
  termsAccepted: boolean("termsAccepted").default(false),
});
export const wallet = pgTable("wallet", {
  id: varchar("id", { length: 256 }).primaryKey(),
  walletBalance: decimal("walletBalance", {
    precision: 36,
    scale: 18,
  }).notNull(),
});
export const maintainerWallet = pgTable("maintainerWallet", {
  id: varchar("id", { length: 256 }).primaryKey(),
  walletBalance: decimal("maintainerWalletBalance", {
    precision: 36,
    scale: 18,
  }).notNull(),
});
export const MaintainerWalletTransactions = pgTable(
  "maintainerWallet_transactions",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 256 }),
    amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
    transactionType: varchar("transactionType", { length: 256 }).notNull(),
    timestamp: timestamp("timestamp").default(sql`now()`),
  }
);
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 256 }),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  transactionType: varchar("transactionType", { length: 256 }).notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

// Messages Table
export const messages = pgTable("messages", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  text: text("text"),
  timestamp: timestamp("timestamp"),
  reciever_id: varchar("reciever_id", { length: 256 }),
  sender_id: varchar("sender_id", { length: 256 }),
});

// Issues Table
export const issues = pgTable("issues", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  issue_name: varchar("issue_name", { length: 256 }),
  issue_url: varchar("issue_url", { length: 256 }).unique(),
  publisher: varchar("publisher", { length: 256 }),
  issue_description: text("issue_description"),
  issue_date: varchar("issue_date", { length: 256 }),
  Difficulty: varchar("Difficulty", { length: 256 }),
  priority: varchar("Priority", { length: 256 }),
  project_repository: varchar("Repository", { length: 256 }),
  project_issues: varchar("issues", { length: 256 }),
  rewardAmount: varchar("rewardAmount", { length: 256 }),
  active: boolean("active").default(true),
});

// Project Table
export const project = pgTable("project", {
  projectName: varchar("id", { length: 256 }).primaryKey(),
  aiDescription: text("AI Description"),
  projectOwner: varchar("ProjectOwner", { length: 256 }),
  shortdes: text("Short Description"),
  longdis: text("Long Description"),
  image_url: varchar("image_url", { length: 256 }),
  project_repository: varchar("Repository", { length: 256 }),
  contributors: json("maintainers"),
  maintainerUserIds: json("maintainerUserIds"),
  type: varchar("type", { length: 256 }),
  languages: json("languages"),
  stars: varchar("stars"),
  forks: varchar("forks"),
  owner: json("owner"),
  comits: json("comits"),
  Tag: varchar("Tag", { length: 256 }),
});

export const likes = pgTable("likes", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  projectName: varchar("projectName", { length: 256 }),
  userId: varchar("userId", { length: 256 }),
  likedAt: timestamp("likedAt").default(sql`now()`),
});

// Contributor Requests Table
export const contributorRequests = pgTable("contributorRequests", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fullName: varchar("Full Name (User)", { length: 256 }),
  projectName: varchar("projectName", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  contributor_email: varchar("contributor_email", { length: 256 }),
  requestDate: varchar("requestDate", { length: 256 }),
  projectOwner: varchar("projectOwner", { length: 256 }),
  skills: json("skills"),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
  status: varchar("status", { length: 256 }),
});

// Contributor Applications Table
export const contributorApplications = pgTable(
  "contributorApplications",
  {
    id: varchar("id", { length: 256 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 256 }).notNull(), // Auto-filled from session
    projectName: varchar("projectName", { length: 256 }),
    name: varchar("name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    bio: text("bio"),
    whyContribute: text("whyContribute"),
    exampleProjects: text("exampleProjects"),
    languages: json("languages"), // Array of strings
    frameworks: json("frameworks"), // Array of strings
    tools: json("tools"), // Array of strings
    otherSkills: text("otherSkills"),
    experienceMatrix: json("experienceMatrix"), // Object with language experience data
    resumeUrl: varchar("resumeUrl", { length: 512 }), // File upload URL
    samplePatchesUrl: varchar("samplePatchesUrl", { length: 512 }), // File upload URL
    sshPublicKey: text("sshPublicKey"),
    prLinks: text("prLinks"),
    accessLevel: varchar("accessLevel", { length: 100 }),
    ndaAgreement: boolean("ndaAgreement").default(false),
    twoFactorEnabled: boolean("twoFactorEnabled").default(false),
    earliestStartDate: varchar("earliestStartDate", { length: 50 }),
    codeOfConductAgreed: boolean("codeOfConductAgreed").default(false),
    contributionGuidelinesAgreed: boolean(
      "contributionGuidelinesAgreed"
    ).default(false),
    fullName: varchar("fullName", { length: 256 }),
    signatureDate: varchar("signatureDate", { length: 50 }),
    status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
    submittedAt: timestamp("submittedAt").default(sql`now()`),
  },
  (table) => {
    return {
      // Add unique constraint on username + projectName combination
      usernameProjectUnique: unique().on(table.username, table.projectName),
    };
  }
);

// The rest of your tables (pullRequests, assignIssues, assignedIssues, pendingReview, completedIssues, Rewards) remain unchanged, as they do not have foreign key constraints or relations that need correction.
export const payments = pgTable("Payments", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 256 }),
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("createdAt").default(sql`now()`),
});

export const assignedIssues = pgTable("assignedIssues", {
  projectName: varchar("projectName", { length: 256 }),
  projectOwner: varchar("projectOwner", { length: 256 }),
  Contributor_id: varchar("Contributor", { length: 256 }),
  issue: varchar("issue", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  name: varchar("name", { length: 256 }),
  description: text("description"),
});

export const Rewards = pgTable("rewards", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  issue_id: varchar("issue_id", { length: 256 }),
  projectName: varchar("projectName", { length: 256 }),
  projectDescription: text("projectDescription"),
  projectOwner: varchar("projectOwner", { length: 256 }),
  project_repository: varchar("project_repository", { length: 256 }),
  Contributor_id: varchar("Contributor Name", { length: 256 }),
  Contributor: varchar("Contributor_id", { length: 256 }),
  transactionHash: varchar("transactionHash", { length: 256 }),
  withdrawn: boolean("withdrawn").default(false),
  rewardAmount: doublePrecision("rewardAmount"),
  issue: varchar("issue", { length: 256 }),
  date: timestamp("date").default(sql`now()`),
});

// Project Embeddings Table for RAG
export const projectEmbeddings = pgTable("project_embeddings", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  projectName: varchar("project_name", { length: 256 }).notNull(),
  description: text("description").notNull(),
  languages: text("languages"), // JSON string of languages
  owner: varchar("owner", { length: 256 }),
  // embedding: vector("embedding", { dimensions: 384 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const projects = pgTable("projects", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description").notNull(),
  owner: varchar("owner", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const hackathons = pgTable("hackathons", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  image_url: varchar("image_url", { length: 256 }),
  status: varchar("status", { length: 50 }).default('upcoming'),
  created_at: timestamp("created_at").default(sql`now()`),
  created_by: varchar("created_by", { length: 256 }).references(() => users.id)
});

export const hack_projects = pgTable("hack_projects", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  hackathon_id: varchar("hackathon_id", { length: 256 }).references(() => hackathons.id),
  project_name: varchar("project_name", { length: 256 }).notNull(),
  description: text("description"),
  repository: varchar("repository", { length: 256 }),
  image_url: varchar("image_url", { length: 256 }),
  owner_id: varchar("owner_id", { length: 256 }).references(() => users.id),
  team_members: jsonb("team_members"),
  tech_stack: jsonb("tech_stack"),
  contract_address: varchar("contract_address", { length: 256 }),
  created_at: timestamp("created_at").default(sql`now()`)
});


export const project_votes = pgTable("project_votes", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  project_id: varchar("project_id", { length: 256 }).references(() => hack_projects.id),
  voter_id: varchar("voter_id", { length: 256 }).references(() => users.id),
  vote_type: varchar("vote_type", { length: 50 }).notNull(),
  vote_weight: integer("vote_weight").default(1),
  created_at: timestamp("created_at").default(sql`now()`),
}, (t) => [
     unique('project_votes_project_voter_unique_idx').on(t.project_id, t.voter_id)
]);

export const project_split_payments = pgTable("project_split_payments", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  project_id: varchar("project_id", { length: 256 }).references(() => hack_projects.id),
  total_amount: varchar("total_amount", { length: 256 }).notNull(),
  contributor_share: varchar("contributor_share", { length: 256 }).notNull(),
  maintainer_share: varchar("maintainer_share", { length: 256 }).notNull(),
  transaction_hash: varchar("transaction_hash", { length: 256 }),
  status: varchar("status", { length: 50 }).default("pending"),
  created_at: timestamp("created_at").defaultNow()
});

export const hackathon_results = pgTable("hackathon_results", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  hackathon_id: varchar("hackathon_id", { length: 256 }).references(() => hackathons.id),
  project_id: varchar("project_id", { length: 256 }).references(() => hack_projects.id),
  final_rank: integer("final_rank"),
  total_votes: integer("total_votes").default(0),
  yes_votes: integer("yes_votes").default(0),
  no_votes: integer("no_votes").default(0),
  approval_percentage: decimal("approval_percentage", { precision: 5, scale: 2 }),
  voting_status: varchar("voting_status", { length: 50 }).default("pending"), // pending, approved, rejected
  total_funding: decimal("total_funding", { precision: 36, scale: 18 }).default("0"),
  contributors_funding: decimal("contributors_funding", { precision: 36, scale: 18 }).default("0"),
  maintainers_funding: decimal("maintainers_funding", { precision: 36, scale: 18 }).default("0"),
  award_category: varchar("award_category", { length: 100 }), // "winner", "runner-up", "innovation", etc.
  judge_feedback: text("judge_feedback"),
  demo_url: varchar("demo_url", { length: 512 }),
  presentation_url: varchar("presentation_url", { length: 512 }),
  final_score: decimal("final_score", { precision: 5, scale: 2 }),
  metrics: jsonb("metrics"), // Custom metrics like code quality, innovation, etc.
  created_at: timestamp("created_at").default(sql`now()`),
  updated_at: timestamp("updated_at").default(sql`now()`)
}, (t) => [
  unique('hackathon_results_hackathon_project_unique').on(t.hackathon_id, t.project_id)
]);

export const project_certificates = pgTable("project_certificates", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  project_id: varchar("project_id", { length: 256 }).references(() => hack_projects.id),
  ipfs_hash: text("ipfs_hash").notNull(),
  url: text("url"),
  issued_at: timestamp("issued_at").default(sql`now()`),
  issued_by: text("issued_by").notNull(),
  issued_to: varchar("issued_to", { length: 256 }).references(() => users.id),
});
