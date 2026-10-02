'use client';
import { PageHeader, PlatformSuite } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
export default function IntelligenceSuitePage(){return <AdminShell active="intelligence"><PageHeader eyebrow="TELYAD · INTELLIGENCE SUITE V3" title="Platform Intelligence & Control" desc="Cross-operator governance, commercial controls, integrations and platform intelligence." /><PlatformSuite realm="admin" /></AdminShell>;}
