-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Telco" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "revenueShareBps" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "partnerSince" TEXT,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "Telco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "telcoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ENTERPRISE',
    "status" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "accountManager" TEXT,
    "since" TEXT,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "realm" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "telcoId" TEXT,
    "advertiserId" TEXT,
    "status" TEXT NOT NULL,
    "lastLoginAt" TEXT,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "telcoId" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "formatId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "audienceJson" TEXT NOT NULL,
    "estimatedReach" INTEGER NOT NULL,
    "budgetJson" TEXT NOT NULL,
    "complianceScore" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "submittedAt" TEXT,
    "approvedAt" TEXT,
    "approvedByTelcoName" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignApproval" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "telcoId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "approverUserId" TEXT NOT NULL,
    "approverName" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "decidedAt" TEXT NOT NULL,

    CONSTRAINT "CampaignApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "telcoId" TEXT,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelcoCapabilityAvailability" (
    "id" TEXT NOT NULL,
    "telcoId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "TelcoCapabilityAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "telcoId" TEXT,
    "audienceRealm" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Advertiser_telcoId_idx" ON "Advertiser"("telcoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_telcoId_idx" ON "User"("telcoId");

-- CreateIndex
CREATE INDEX "User_advertiserId_idx" ON "User"("advertiserId");

-- CreateIndex
CREATE INDEX "Campaign_telcoId_idx" ON "Campaign"("telcoId");

-- CreateIndex
CREATE INDEX "Campaign_advertiserId_idx" ON "Campaign"("advertiserId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "CampaignApproval_campaignId_idx" ON "CampaignApproval"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignApproval_telcoId_idx" ON "CampaignApproval"("telcoId");

-- CreateIndex
CREATE INDEX "AuditEvent_telcoId_idx" ON "AuditEvent"("telcoId");

-- CreateIndex
CREATE INDEX "TelcoCapabilityAvailability_telcoId_idx" ON "TelcoCapabilityAvailability"("telcoId");

-- CreateIndex
CREATE UNIQUE INDEX "TelcoCapabilityAvailability_telcoId_capabilityId_key" ON "TelcoCapabilityAvailability"("telcoId", "capabilityId");

