'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardHead, Progress } from './primitives';
import { IntelligenceStrip } from './intelligence';

export type SuiteRealm = 'advertiser' | 'telco' | 'admin' | 'telydial';
type Feature={id:number;name:string;group:string;description:string;realms:SuiteRealm[];mode:'DEMO'|'REAL'|'EXT'};
export const PLATFORM_SUITE_FEATURES:Feature[]=[
{ id:1,name:'TelyAd Intelligence Copilot',group:'Intelligence',description:'Contextual campaign, audience and commercial decision support with governed deterministic recommendations.',realms:['advertiser','telco','admin','telydial'],mode:'DEMO' },
{ id:2,name:'Carrier Inventory & Yield',group:'Monetisation',description:'Capacity, committed inventory, utilisation, sell-through and yield across carrier advertising surfaces.',realms:['telco','admin'],mode:'DEMO' },
{ id:3,name:'Revenue Forecasting & Opportunity',group:'Monetisation',description:'Actual-versus-forecast revenue, unused inventory value and incremental revenue scenarios.',realms:['telco','admin'],mode:'DEMO' },
{ id:4,name:'Audience Discovery & Segment Builder',group:'Audience',description:'Privacy-safe aggregate segment discovery across geography, device, usage and behavioural signals.',realms:['advertiser','telco','telydial'],mode:'DEMO' },
{ id:5,name:'Lookalike & Audience Expansion',group:'Audience',description:'Suggest adjacent aggregate cohorts from high-performing audience definitions without exposing identities.',realms:['advertiser','telco','telydial'],mode:'DEMO' },
{ id:6,name:'Campaign Recommendation Engine',group:'Planning',description:'Recommend capability and channel mixes from objective, audience, budget and device characteristics.',realms:['advertiser','telydial'],mode:'DEMO' },
{ id:7,name:'Frequency & Saturation Intelligence',group:'Governance',description:'Aggregate frequency, overlap, fatigue risk, channel pressure and recommended exposure caps.',realms:['advertiser','telco'],mode:'DEMO' },
{ id:8,name:'Journey Orchestration',group:'Planning',description:'Compose multi-step carrier journeys with triggers, retargeting and fallback paths across capabilities.',realms:['advertiser','telco','telydial'],mode:'DEMO' },
{ id:9,name:'Experimentation & A/B Testing',group:'Optimisation',description:'Creative, audience, channel and frequency experiments with controlled comparison and outcome tracking.',realms:['advertiser','telydial'],mode:'DEMO' },
{ id:10,name:'Conversion & Attribution Hub',group:'Measurement',description:'Conversion postbacks, attributed outcomes, CPA and privacy-safe funnel performance.',realms:['advertiser','telco','telydial'],mode:'EXT' },
{ id:11,name:'Creative Intelligence & Compliance',group:'Governance',description:'Pre-flight creative, destination, disclaimer, format and device-compatibility checks before approval.',realms:['advertiser','telco','telydial'],mode:'DEMO' },
{ id:12,name:'Campaign Simulator / Digital Twin',group:'Planning',description:'Model reach, frequency, impressions, channel mix, expected outcomes and cost before spend.',realms:['advertiser','telco','telydial'],mode:'DEMO' },
{ id:13,name:'Executive Command Centre',group:'Monetisation',description:'Executive view of advertising revenue, inventory utilisation, advertiser activity and exceptions.',realms:['telco','admin'],mode:'DEMO' },
{ id:14,name:'Advertiser Self-Service Onboarding',group:'Lifecycle',description:'Organisation, users, billing profile, permissions and commercial onboarding lifecycle.',realms:['advertiser','telco','admin'],mode:'REAL' },
{ id:15,name:'Commercial Marketplace & Rate Cards',group:'Monetisation',description:'Capability pricing, negotiated terms, volume bands, effective dates and approval history.',realms:['telco','admin'],mode:'REAL' },
{ id:16,name:'Audit, Governance & Privacy Centre',group:'Governance',description:'Access, campaign approvals, configuration changes, privacy controls and exportable audit evidence.',realms:['telco','admin'],mode:'REAL' },
{ id:17,name:'Notification & Exception Centre',group:'Operations',description:'Approval, budget, inventory, delivery, access-expiry and integration exceptions in one queue.',realms:['advertiser','telco','admin','telydial'],mode:'REAL' },
{ id:18,name:'Anomaly Detection',group:'Operations',description:'Rule-driven detection of abnormal delivery, spend, response, revenue and integration behaviour.',realms:['advertiser','telco','admin','telydial'],mode:'DEMO' },
{ id:19,name:'Multi-Operator Control Plane',group:'Platform',description:'Operator isolation, operator-specific inventory, pricing, governance, reporting and environment controls.',realms:['admin'],mode:'REAL' },
{ id:20,name:'API, Partner & Developer Centre',group:'Platform',description:'Integration contracts for API keys, webhooks, callbacks, sandbox journeys and service health.',realms:['admin','telco'],mode:'EXT' },
];
const GROUPS=['All','Intelligence','Monetisation','Audience','Planning','Optimisation','Measurement','Governance','Lifecycle','Operations','Platform'];
export function PlatformSuite({realm}:{realm:SuiteRealm}){
 const [group,setGroup]=useState('All'),[budget,setBudget]=useState(120),[target,setTarget]=useState(20),[frequency,setFrequency]=useState(3);
 const eligible=73.1,uniqueReach=Math.min(target*.93,eligible),impressions=uniqueReach*frequency,forecastCost=impressions*2.35;
 const budgetFit=forecastCost<=budget,frequencyRisk=frequency>=6?'High':frequency>=4?'Watch':'Healthy';
 const features=useMemo(()=>PLATFORM_SUITE_FEATURES.filter(f=>f.realms.includes(realm)&&(group==='All'||f.group===group)),[realm,group]);
 const realmTotal=PLATFORM_SUITE_FEATURES.filter(f=>f.realms.includes(realm)).length;
 return <div>
  <IntelligenceStrip title="TelyAd Intelligence Suite" status="V3 capability control plane" metrics={[
   {label:'Platform capabilities',value:'20 / 20',note:'registered across the ecosystem'},
   {label:'Available in this portal',value:realmTotal,note:'role and realm scoped'},
   {label:'Eligible universe',value:'73.1M',note:'network eligibility universe · DEMO'},
   {label:'Privacy boundary',value:'Aggregate only',note:'no MSISDN or identity exposure'}]}/>
  <Card><CardHead title="Campaign Digital Twin" sub="Change planning assumptions and see the deterministic forecast update before launch." action={<Badge tone="info">DEMO</Badge>}/>
   <div className="tly-suite-simulator">
    <label>Budget <strong>₦{budget}M</strong><input aria-label="Budget" type="range" min="10" max="500" value={budget} onChange={e=>setBudget(Number(e.target.value))}/></label>
    <label>Selected target <strong>{target}M</strong><input aria-label="Selected target" type="range" min="1" max="60" value={target} onChange={e=>setTarget(Number(e.target.value))}/></label>
    <label>Frequency <strong>{frequency}×</strong><input aria-label="Frequency" type="range" min="1" max="8" value={frequency} onChange={e=>setFrequency(Number(e.target.value))}/></label>
   </div>
   <div className="tly-suite-forecast"><div><span>Eligible</span><strong>{eligible.toFixed(1)}M</strong></div><div><span>Selected</span><strong>{target.toFixed(1)}M</strong></div><div><span>Unique reach</span><strong>{uniqueReach.toFixed(1)}M</strong></div><div><span>Impressions</span><strong>{impressions.toFixed(1)}M</strong></div><div><span>Modelled media</span><strong>₦{forecastCost.toFixed(1)}M</strong></div></div>
   <div className="tly-suite-forecast"><div><span>Budget fit</span><strong>{budgetFit?'Within budget':'Over budget'}</strong></div><div><span>Frequency pressure</span><strong>{frequencyRisk}</strong></div><div><span>Headroom</span><strong>₦{Math.abs(budget-forecastCost).toFixed(1)}M {budgetFit?'left':'gap'}</strong></div></div><Progress value={Math.min(100,(forecastCost/budget)*100)}/><div className="tly-faint" style={{fontSize:11,marginTop:8}}>Illustrative deterministic scenario only. Production forecasting requires approved carrier inventory, pricing and delivery inputs.</div>
  </Card>
  <div className="tly-suite-toolbar" role="group" aria-label="Capability categories">{GROUPS.map(g=><Button key={g} size="sm" variant={group===g?'primary':'ghost'} onClick={()=>setGroup(g)}>{g}</Button>)}</div>
  <div className="tly-suite-grid">{features.map(f=><Card key={f.id} className="tly-suite-card"><div className="tly-suite-number">{String(f.id).padStart(2,'0')}</div><div className="tly-suite-card-body"><CardHead title={f.name} action={<Badge tone={f.mode==='REAL'?'success':f.mode==='EXT'?'warning':'info'}>{f.mode}</Badge>}/><p>{f.description}</p><div className="tly-suite-meta"><span>{f.group}</span><span>{f.realms.map(x=>x==='telco'?'Operator':x==='admin'?'Master Admin':x==='telydial'?'TelyDial':'Advertiser').join(' · ')}</span></div></div></Card>)}</div>
 </div>;
}
