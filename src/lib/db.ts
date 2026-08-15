import path from 'path';
import crypto from 'crypto';

interface FRRow {
  title: string;
  area: string;
  status: string;
  accountStr: string;
  mentions: number;
  revStr: string;
  stageOverride?: string;
}

const accountsSeed: [string, string, string, string, string, string, string, string][] = [
  ['acct-001','Meridian AgriTech','agriculture','north_america','enterprise','healthy','$75,000','Theo Naidoo'],
  ['acct-002','Northfall Security Group','security','europe','starter','healthy','$0','Amara Reyes'],
  ['acct-003','Blue Harbor Logistics','logistics','asia_pacific','enterprise','healthy','$0','Tom Ferreira'],
  ['acct-004','Cascade Utilities Co','energy','north_america','starter','healthy','$0','Felix Kowalski'],
  ['acct-005','Ironvale Mining','mining','latin_america','enterprise','healthy','$42,000','Yusuf Holt'],
  ['acct-006','Sable Point Surveillance','security','north_america','zero','healthy','$120,000','Jordan Delacroix'],
  ['acct-007','Windridge Energy','energy','europe','enterprise','healthy','$15,000','Derek Ferreira'],
  ['acct-008','Coastal Guard Patrol','public_safety','asia_pacific','zero','healthy','$24,000','Fatima Falkner'],
  ['acct-009','Highline Rail Services','rail','europe','zero','healthy','$120,000','Priya Duarte'],
  ['acct-010','Terra Nova Agriculture','agriculture','latin_america','enterprise','healthy','$24,000','Tom Pham'],
  ['acct-011','Pacific Rim Construction','construction','asia_pacific','zero','at_risk','$42,000','Ravi Osei'],
  ['acct-012','Stonebridge Inspection Services','inspection','north_america','starter','healthy','$0','Mei Tanaka'],
  ['acct-013','Aurora Grid Power','energy','north_america','starter','at_risk','$120,000','Fatima Vance'],
  ['acct-014','Redstone Emergency Response','public_safety','north_america','zero','healthy','$120,000','Ravi Delacroix'],
  ['acct-015','Vantage Point Media','media','europe','zero','healthy','$75,000','Theo Novak'],
  ['acct-016','Silver Creek Oil & Gas','oil_gas','north_america','enterprise','healthy','$42,000','Ivo Delacroix'],
  ['acct-017','Amber Ridge Forestry','forestry','north_america','zero','healthy','$75,000','Felix Holt'],
  ['acct-018','Timberline Maritime','maritime','europe','enterprise','healthy','$120,000','Marcus Holt'],
  ['acct-019','Granite Bay Telecom','telecom','asia_pacific','starter','at_risk','$24,000','Theo Novak'],
  ['acct-020','Copper Basin Insurance','insurance','north_america','starter','at_risk','$42,000','Alina Ferreira'],
  ['acct-021','Fairwind Properties','real_estate','europe','enterprise','healthy','$75,000','Chidi Sung'],
  ['acct-022','Brightwater Events','event_production','north_america','zero','healthy','$75,000','Felix Castellano'],
  ['acct-023','Stillwater Surveying','surveying','latin_america','zero','healthy','$24,000','Rosalind Sorensen'],
  ['acct-024','Ridgeline Water Management','water_management','north_america','zero','healthy','$8,000','Leilani Adeyemi'],
  ['acct-025','Longview Conservation Trust','conservation','asia_pacific','starter','healthy','$120,000','Liam Sung'],
  ['acct-026','Northgate Agriculture','agriculture','europe','enterprise','healthy','$75,000','Petra Voss'],
  ['acct-027','Southport Logistics','logistics','north_america','starter','healthy','$42,000','Chidi Solberg'],
  ['acct-028','Westfield Security Group','security','latin_america','zero','at_risk','$120,000','Jordan Lindqvist'],
  ['acct-029','Eastbrook Energy','energy','asia_pacific','enterprise','at_risk','$120,000','Theo Mbeki'],
  ['acct-030','Clearwater Mining','mining','north_america','starter','healthy','$8,000','Chidi Whitfield'],
  ['acct-031','Ashgrove Rail Services','rail','north_america','enterprise','at_risk','$15,000','Leilani Marsh'],
  ['acct-032','Thornfield Construction','construction','europe','enterprise','at_risk','$120,000','Bram Rutherford'],
  ['acct-033','Wildmark Inspection Services','inspection','asia_pacific','enterprise','healthy','$15,000','Sana Castellano'],
  ['acct-034','Hollowridge Grid Power','energy','latin_america','enterprise','at_risk','$42,000','Alina Adeyemi'],
  ['acct-035','Frostgate Emergency Response','public_safety','europe','starter','healthy','$15,000','Bram Naidoo'],
  ['acct-036','Sundale Media','media','north_america','starter','healthy','$42,000','Tom Reyes'],
  ['acct-037','Moonvale Oil & Gas','oil_gas','latin_america','enterprise','healthy','$0','Amara Abara'],
  ['acct-038','Starling Forestry','forestry','europe','starter','healthy','$42,000','Sana Bergstrom'],
  ['acct-039','Driftwood Maritime','maritime','asia_pacific','enterprise','at_risk','$24,000','Kai Castellano'],
  ['acct-040','Palisade Telecom','telecom','north_america','enterprise','healthy','$75,000','Bram Sorensen'],
  ['acct-041','Quarrystone Insurance','insurance','europe','enterprise','healthy','$24,000','Boris Kimura'],
  ['acct-042','Millbrook Properties','real_estate','north_america','starter','healthy','$0','Dev Okafor'],
  ['acct-043','Fernwood Events','event_production','asia_pacific','enterprise','healthy','$42,000','Mei Whitfield'],
  ['acct-044','Larkspur Surveying','surveying','north_america','starter','healthy','$0','Mei Novak'],
  ['acct-045','Brambleton Water Management','water_management','europe','starter','at_risk','$0','Leilani Naidoo'],
  ['acct-046','Cinderfield Conservation Trust','conservation','north_america','zero','healthy','$8,000','Amara Abara'],
  ['acct-047','Elmswood AgriTech','agriculture','latin_america','enterprise','at_risk','$42,000','Junko Wexler'],
  ['acct-048','Hawkridge Security Group','security','asia_pacific','starter','healthy','$120,000','Yusuf Kowalski'],
  ['acct-049','Foxglenn Logistics','logistics','europe','starter','healthy','$24,000','Freya Alavi'],
  ['acct-050','Ravenhollow Mining','mining','asia_pacific','zero','healthy','$75,000','Marcus Carrow'],
  ['acct-051','Duskfield Construction','construction','north_america','starter','healthy','$15,000','Fatima Naidoo'],
];

const rowsSeed: FRRow[] = [
  // NEW (10)
  {title:'Bulk export of flight logs to CSV',area:'reports',status:'new',accountStr:'Longview Conservation Trust, Starling Forestry, Fernwood Events',mentions:3,revStr:'$34,959', stageOverride: 'new'},
  {title:'Custom alert thresholds per device',area:'dashboard',status:'new',accountStr:'Duskfield Construction, Brambleton Water Management, Palisade Telecom, Timberline Maritime, Cascade Utilities Co, Clearwater Mining',mentions:6,revStr:'$73,883', stageOverride: 'new'},
  {title:'Automatic firmware rollback on failed update',area:'fleet',status:'new',accountStr:'Pacific Rim Construction, Aurora Grid Power, Vantage Point Media, Blue Harbor Logistics, Southport Logistics',mentions:5,revStr:'$76,508', stageOverride: 'new'},
  {title:'Third-party mapping layer integration',area:'integrations',status:'new',accountStr:'Ravenhollow Mining, Granite Bay Telecom, Clearwater Mining, Pacific Rim Construction, Westfield Security Group, Duskfield Construction, Palisade Telecom',mentions:7,revStr:'$105,332', stageOverride: 'new'},
  {title:'Shared device calendar across team members',area:'fleet',status:'new',accountStr:'Northgate Agriculture, Southport Logistics, Fairwind Properties, Eastbrook Energy, Northfall Security Group',mentions:6,revStr:'$114,338', stageOverride: 'new'},
  {title:'Live detection count overlay on stream',area:'streaming',status:'new',accountStr:'Southport Logistics, Copper Basin Insurance, Elmswood AgriTech',mentions:6,revStr:'$36,617', stageOverride: 'new'},
  {title:'Single sign-on support for enterprise accounts',area:'other',status:'new',accountStr:'Meridian AgriTech, Palisade Telecom, Foxglenn Logistics, Amber Ridge Forestry, Duskfield Construction, Clearwater Mining',mentions:9,revStr:'$108,109', stageOverride: 'new'},
  {title:'Batch renaming of devices and sites',area:'fleet',status:'new',accountStr:'Clearwater Mining, Southport Logistics, Hawkridge Security Group, Cascade Utilities Co, Hollowridge Grid Power, Copper Basin Insurance, Moonvale Oil & Gas, Larkspur Surveying',mentions:10,revStr:'$95,364', stageOverride: 'new'},
  {title:'Two-factor authentication enforcement at the org level',area:'other',status:'new',accountStr:'Redstone Emergency Response, Elmswood AgriTech, Blue Harbor Logistics, Clearwater Mining, Longview Conservation Trust',mentions:5,revStr:'$87,045', stageOverride: 'new'},
  {title:'Exportable API usage report per integration',area:'integrations',status:'new',accountStr:'Coastal Guard Patrol, Meridian AgriTech, Palisade Telecom, Sundale Media, Wildmark Inspection Services, Windridge Energy, Redstone Emergency Response',mentions:9,revStr:'$182,034', stageOverride: 'new'},

  // TRIAGED (8)
  {title:'Role-based dashboard widgets',area:'dashboard',status:'new',accountStr:'Vantage Point Media, Longview Conservation Trust, Wildmark Inspection Services, Cinderfield Conservation Trust, Windridge Energy, Fairwind Properties, Thornfield Construction, Driftwood Maritime, Frostgate Emergency Response',mentions:9,revStr:'$215,932', stageOverride: 'triaged'},
  {title:'Scheduled recurring missions',area:'missions',status:'new',accountStr:'Vantage Point Media, Terra Nova Agriculture, Brightwater Events, Northgate Agriculture, Fernwood Events, Highline Rail Services, Sable Point Surveillance',mentions:10,revStr:'$184,907', stageOverride: 'triaged'},
  {title:'Cross-account fleet comparison view',area:'fleet',status:'new',accountStr:'Eastbrook Energy, Frostgate Emergency Response, Highline Rail Services, Redstone Emergency Response, Millbrook Properties, Foxglenn Logistics, Starling Forestry, Ravenhollow Mining',mentions:9,revStr:'$106,388', stageOverride: 'triaged'},
  {title:'Audit log export for compliance reviews',area:'reports',status:'new',accountStr:'Clearwater Mining, Southport Logistics, Eastbrook Energy, Sable Point Surveillance, Driftwood Maritime, Elmswood AgriTech, Meridian AgriTech, Silver Creek Oil & Gas, Sundale Media, Timberline Maritime',mentions:11,revStr:'$220,746', stageOverride: 'triaged'},
  {title:'Custom branding on the customer-facing view',area:'dashboard',status:'new',accountStr:'Foxglenn Logistics, Westfield Security Group, Sundale Media, Ironvale Mining',mentions:6,revStr:'$57,412', stageOverride: 'triaged'},
  {title:'Webhook support for mission completion events',area:'integrations',status:'new',accountStr:'Meridian AgriTech, Quarrystone Insurance, Aurora Grid Power, Brambleton Water Management, Granite Bay Telecom, Amber Ridge Forestry',mentions:6,revStr:'$101,680', stageOverride: 'triaged'},
  {title:'Searchable full-text index across mission notes',area:'reports',status:'new',accountStr:'Thornfield Construction, Silver Creek Oil & Gas, Ridgeline Water Management, Eastbrook Energy',mentions:6,revStr:'$120,964', stageOverride: 'triaged'},
  {title:'Team activity audit log with filters by user',area:'dashboard',status:'new',accountStr:'Ashgrove Rail Services, Longview Conservation Trust, Ironvale Mining, Brightwater Events, Redstone Emergency Response',mentions:8,revStr:'$119,821', stageOverride: 'triaged'},

  // PLANNED (7)
  {title:'Configurable data retention per account',area:'other',status:'new',accountStr:'Copper Basin Insurance, Eastbrook Energy, Hawkridge Security Group, Quarrystone Insurance, Timberline Maritime, Terra Nova Agriculture, Aurora Grid Power, Windridge Energy, Highline Rail Services',mentions:10,revStr:'$201,580', stageOverride: 'planned'},
  {title:'Bandwidth throttling controls for live stream quality',area:'streaming',status:'new',accountStr:'Blue Harbor Logistics, Windridge Energy, Hollowridge Grid Power, Fernwood Events, Copper Basin Insurance, Northfall Security Group, Moonvale Oil & Gas, Elmswood AgriTech, Quarrystone Insurance, Redstone Emergency Response',mentions:12,revStr:'$260,681', stageOverride: 'planned'},
  {title:'Custom map basemap upload for offline sites',area:'missions',status:'new',accountStr:'Eastbrook Energy, Stonebridge Inspection Services, Copper Basin Insurance, Northgate Agriculture',mentions:4,revStr:'$83,561', stageOverride: 'planned'},
  {title:'Scheduled report delivery via email digest',area:'reports',status:'new',accountStr:'Coastal Guard Patrol, Granite Bay Telecom, Northfall Security Group, Silver Creek Oil & Gas, Westfield Security Group, Brambleton Water Management, Starling Forestry, Northgate Agriculture',mentions:10,revStr:'$131,316', stageOverride: 'planned'},
  {title:'Public API sandbox environment for integration testing',area:'integrations',status:'new',accountStr:'Silver Creek Oil & Gas, Ashgrove Rail Services, Quarrystone Insurance, Hawkridge Security Group',mentions:4,revStr:'$110,313', stageOverride: 'planned'},
  {title:'Inline commenting on shared reports',area:'reports',status:'new',accountStr:'Ashgrove Rail Services, Clearwater Mining, Wildmark Inspection Services',mentions:6,revStr:'$78,731', stageOverride: 'planned'},
  {title:'Split-screen comparison view for two live feeds',area:'streaming',status:'new',accountStr:'Palisade Telecom, Timberline Maritime, Amber Ridge Forestry, Meridian AgriTech, Hawkridge Security Group',mentions:5,revStr:'$132,241', stageOverride: 'planned'},

  // IN DEVELOPMENT (5)
  {title:'Mobile push notifications for critical alerts',area:'reports',status:'in_progress',accountStr:'Sundale Media, Frostgate Emergency Response, Elmswood AgriTech, Coastal Guard Patrol',mentions:5,revStr:'$54,291', stageOverride: 'in_development'},
  {title:'API rate limit increase for high-volume integrations',area:'integrations',status:'in_progress',accountStr:'Brambleton Water Management, Ravenhollow Mining, Ashgrove Rail Services, Highline Rail Services',mentions:7,revStr:'$79,539', stageOverride: 'in_development'},
  {title:'Exportable compliance report bundle',area:'reports',status:'in_progress',accountStr:'Sundale Media, Longview Conservation Trust, Hollowridge Grid Power',mentions:3,revStr:'$42,081', stageOverride: 'in_development'},
  {title:'Bulk tagging for missions by site or region',area:'missions',status:'in_progress',accountStr:'Sable Point Surveillance, Cascade Utilities Co, Windridge Energy, Southport Logistics, Stonebridge Inspection Services, Pacific Rim Construction, Larkspur Surveying, Granite Bay Telecom',mentions:9,revStr:'$93,188', stageOverride: 'in_development'},
  {title:'Bulk import of devices via spreadsheet upload',area:'fleet',status:'in_progress',accountStr:'Ridgeline Water Management, Northgate Agriculture, Stonebridge Inspection Services, Brambleton Water Management, Fernwood Events, Brightwater Events, Fairwind Properties',mentions:10,revStr:'$145,788', stageOverride: 'in_development'},

  // TESTING / QA (4)
  {title:'Configurable video retention window per site',area:'streaming',status:'in_progress',accountStr:'Brambleton Water Management, Millbrook Properties, Cinderfield Conservation Trust, Pacific Rim Construction, Foxglenn Logistics, Coastal Guard Patrol, Sable Point Surveillance, Elmswood AgriTech',mentions:11,revStr:'$130,439', stageOverride: 'testing'},
  {title:'Configurable alert quiet hours per site',area:'dashboard',status:'in_progress',accountStr:'Northfall Security Group, Brightwater Events, Longview Conservation Trust, Quarrystone Insurance, Frostgate Emergency Response, Pacific Rim Construction, Moonvale Oil & Gas',mentions:10,revStr:'$112,903', stageOverride: 'testing'},
  {title:'Custom detection zones within a single camera feed',area:'streaming',status:'in_progress',accountStr:'Highline Rail Services, Sable Point Surveillance, Duskfield Construction, Millbrook Properties, Southport Logistics, Clearwater Mining, Brambleton Water Management, Driftwood Maritime, Westfield Security Group',mentions:10,revStr:'$124,021', stageOverride: 'testing'},
  {title:'Configurable session timeout per organization',area:'other',status:'new',accountStr:'Granite Bay Telecom, Thornfield Construction, Sable Point Surveillance',mentions:4,revStr:'$56,094', stageOverride: 'testing'},

  // SHIPPED (11)
  {title:'Offline mission caching for low-connectivity sites',area:'missions',status:'completed',accountStr:'Thornfield Construction, Northgate Agriculture, Hawkridge Security Group, Pacific Rim Construction, Northfall Security Group, Stillwater Surveying, Larkspur Surveying, Cinderfield Conservation Trust',mentions:10,revStr:'$130,614', stageOverride: 'shipped'},
  {title:'Scheduled digest email of weekly account activity',area:'reports',status:'completed',accountStr:'Hollowridge Grid Power, Redstone Emergency Response, Brambleton Water Management, Ravenhollow Mining, Palisade Telecom, Cascade Utilities Co, Windridge Energy, Moonvale Oil & Gas, Quarrystone Insurance',mentions:9,revStr:'$237,978', stageOverride: 'shipped'},
  {title:'Custom user roles beyond the default permission tiers',area:'dashboard',status:'completed',accountStr:'Brightwater Events, Northgate Agriculture, Elmswood AgriTech, Moonvale Oil & Gas, Palisade Telecom, Northfall Security Group, Stonebridge Inspection Services, Aurora Grid Power',mentions:10,revStr:'$168,944', stageOverride: 'shipped'},
  {title:'Automatic duplicate-detection merge in the report view',area:'reports',status:'completed',accountStr:'Duskfield Construction, Blue Harbor Logistics, Aurora Grid Power, Sable Point Surveillance, Eastbrook Energy, Wildmark Inspection Services, Northfall Security Group, Ashgrove Rail Services',mentions:9,revStr:'$166,591', stageOverride: 'shipped'},
  {title:'Custom geofence shapes beyond simple circles and rectangles',area:'missions',status:'completed',accountStr:'Palisade Telecom, Stillwater Surveying, Copper Basin Insurance, Brightwater Events, Aurora Grid Power, Cinderfield Conservation Trust, Fernwood Events, Frostgate Emergency Response, Sable Point Surveillance, Clearwater Mining',mentions:11,revStr:'$158,486', stageOverride: 'shipped'},
  {title:'Per-site operating hour restrictions for automated missions',area:'missions',status:'completed',accountStr:'Granite Bay Telecom, Ravenhollow Mining, Stillwater Surveying, Driftwood Maritime, Moonvale Oil & Gas',mentions:6,revStr:'$108,745', stageOverride: 'shipped'},
  {title:'Configurable watermarking on exported media',area:'reports',status:'completed',accountStr:'Duskfield Construction, Copper Basin Insurance, Frostgate Emergency Response, Clearwater Mining',mentions:7,revStr:'$20,348', stageOverride: 'shipped'},
  {title:'Cold storage archive tier for older recordings',area:'other',status:'completed',accountStr:'Hawkridge Security Group, Cinderfield Conservation Trust, Moonvale Oil & Gas, Thornfield Construction',mentions:4,revStr:'$103,382', stageOverride: 'shipped'},
  {title:'Bulk re-assignment of devices between sites',area:'fleet',status:'completed',accountStr:'Millbrook Properties, Fernwood Events, Cascade Utilities Co, Sable Point Surveillance, Redstone Emergency Response, Highline Rail Services, Starling Forestry, Quarrystone Insurance, Meridian AgriTech, Terra Nova Agriculture',mentions:11,revStr:'$215,754', stageOverride: 'shipped'},
  {title:'Configurable retry policy for failed mission uploads',area:'missions',status:'completed',accountStr:'Moonvale Oil & Gas, Thornfield Construction, Elmswood AgriTech',mentions:4,revStr:'$106,362', stageOverride: 'shipped'},
  {title:'Cross-organization device transfer workflow',area:'fleet',status:'completed',accountStr:'Blue Harbor Logistics, Duskfield Construction, Moonvale Oil & Gas, Ashgrove Rail Services, Cinderfield Conservation Trust, Ridgeline Water Management, Coastal Guard Patrol, Starling Forestry',mentions:11,revStr:'$169,781', stageOverride: 'shipped'},

  // DECLINED (10)
  {title:'Multi-language support for the operator interface',area:'other',status:'declined',accountStr:'Eastbrook Energy, Palisade Telecom, Thornfield Construction, Brambleton Water Management, Fairwind Properties',mentions:8,revStr:'$143,326', stageOverride: 'declined'},
  {title:'Weather-based automatic mission rescheduling',area:'missions',status:'declined',accountStr:'Elmswood AgriTech, Fairwind Properties, Northgate Agriculture, Palisade Telecom, Moonvale Oil & Gas, Driftwood Maritime, Frostgate Emergency Response, Hollowridge Grid Power, Millbrook Properties',mentions:9,revStr:'$254,715', stageOverride: 'declined'},
  {title:'Bulk device firmware scheduling',area:'fleet',status:'declined',accountStr:'Ravenhollow Mining, Pacific Rim Construction, Brightwater Events',mentions:4,revStr:'$49,955', stageOverride: 'declined'},
  {title:'Downloadable offline map packs for low-connectivity sites',area:'missions',status:'declined',accountStr:'Highline Rail Services, Palisade Telecom, Moonvale Oil & Gas, Thornfield Construction, Hollowridge Grid Power, Quarrystone Insurance, Hawkridge Security Group, Brambleton Water Management',mentions:9,revStr:'$188,695', stageOverride: 'declined'},
  {title:'Device health trend graphs over the last 90 days',area:'fleet',status:'declined',accountStr:'Hawkridge Security Group, Redstone Emergency Response, Palisade Telecom, Southport Logistics',mentions:7,revStr:'$62,122', stageOverride: 'declined'},
  {title:'Site-level maintenance mode to pause alerts during servicing',area:'dashboard',status:'declined',accountStr:'Copper Basin Insurance, Palisade Telecom, Brightwater Events, Frostgate Emergency Response',mentions:7,revStr:'$52,149', stageOverride: 'declined'},
  {title:'Historical playback scrubber for stored detections',area:'streaming',status:'declined',accountStr:'Windridge Energy, Longview Conservation Trust, Cascade Utilities Co',mentions:3,revStr:'$43,340', stageOverride: 'declined'},
  {title:'Per-role default dashboard landing page',area:'dashboard',status:'declined',accountStr:'Westfield Security Group, Cinderfield Conservation Trust, Stillwater Surveying, Sable Point Surveillance, Starling Forestry, Meridian AgriTech, Palisade Telecom',mentions:10,revStr:'$136,854', stageOverride: 'declined'},
  {title:'Device pairing via QR code instead of manual entry',area:'fleet',status:'declined',accountStr:'Sundale Media, Longview Conservation Trust, Ridgeline Water Management, Southport Logistics, Terra Nova Agriculture, Granite Bay Telecom',mentions:7,revStr:'$53,155', stageOverride: 'declined'},
  {title:'Bulk export of alerts to a SIEM-compatible format',area:'integrations',status:'declined',accountStr:'Granite Bay Telecom, Pacific Rim Construction, Blue Harbor Logistics, Brambleton Water Management, Driftwood Maritime, Copper Basin Insurance, Moonvale Oil & Gas',mentions:9,revStr:'$134,010', stageOverride: 'declined'},
];

function getPriority(rev: number, mentions: number, accts: number): string {
  const score = rev / 100000 + mentions * 0.5 + accts * 0.3;
  if (score >= 5) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function initSqliteDatabase() {
  const Database = require('better-sqlite3');
  const isVercelOrLambda = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
  const dbPath = isVercelOrLambda
    ? path.resolve('/tmp', 'lifecycle.db')
    : path.resolve(process.cwd(), 'lifecycle.db');

  let dbInstance;
  try {
    dbInstance = new Database(dbPath);
  } catch (err) {
    // If opening file fails (e.g. read-only fs), fall back to in-memory SQLite
    dbInstance = new Database(':memory:');
  }

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT,
      industry TEXT,
      region TEXT,
      tier TEXT,
      health TEXT,
      arr TEXT,
      owner TEXT
    );

    CREATE TABLE IF NOT EXISTS feature_requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      product_area TEXT,
      stage TEXT DEFAULT 'new',
      mentions INTEGER DEFAULT 0,
      accounts_count INTEGER DEFAULT 0,
      revenue_impact TEXT,
      revenue_impact_num INTEGER DEFAULT 0,
      category TEXT DEFAULT 'feature_request',
      priority TEXT DEFAULT 'medium',
      owner TEXT DEFAULT 'product',
      raw_feedback TEXT,
      summary TEXT,
      needs_review INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS request_accounts (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      account_name TEXT,
      FOREIGN KEY(request_id) REFERENCES feature_requests(id)
    );

    CREATE TABLE IF NOT EXISTS related_feedback (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      related_request_id TEXT,
      FOREIGN KEY(request_id) REFERENCES feature_requests(id),
      FOREIGN KEY(related_request_id) REFERENCES feature_requests(id)
    );

    CREATE TABLE IF NOT EXISTS stage_events (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      stage TEXT,
      note TEXT,
      entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES feature_requests(id)
    );

    CREATE TABLE IF NOT EXISTS customer_validations (
      id TEXT PRIMARY KEY,
      request_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      customer_tried INTEGER DEFAULT 0,
      satisfied INTEGER DEFAULT 0,
      feedback_text TEXT,
      follow_up_needed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES feature_requests(id)
    );

    CREATE TABLE IF NOT EXISTS triage_suggestions (
      id TEXT PRIMARY KEY,
      request_id TEXT UNIQUE,
      suggested_category TEXT,
      suggested_product_area TEXT,
      suggested_summary TEXT,
      suggested_priority TEXT,
      suggested_owner TEXT,
      confidence TEXT,
      accepted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(request_id) REFERENCES feature_requests(id)
    );
  `);

  const cnt = (dbInstance.prepare('SELECT COUNT(*) as c FROM feature_requests').get() as { c: number })?.c || 0;

  if (cnt === 0) {
    const insertAccount = dbInstance.prepare(
      'INSERT OR IGNORE INTO accounts (id, name, industry, region, tier, health, arr, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const a of accountsSeed) insertAccount.run(...a);

    const insertReq = dbInstance.prepare(
      `INSERT INTO feature_requests (id, title, product_area, stage, mentions, accounts_count, revenue_impact, revenue_impact_num, category, priority, owner, raw_feedback, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'feature_request', ?, 'product', ?, ?)`
    );
    const insertRA = dbInstance.prepare('INSERT INTO request_accounts (id, request_id, account_name) VALUES (?, ?, ?)');
    const insertSE = dbInstance.prepare('INSERT INTO stage_events (id, request_id, stage, note) VALUES (?, ?, ?, ?)');
    const insertCV = dbInstance.prepare('INSERT INTO customer_validations (id, request_id, status) VALUES (?, ?, ?)');

    const insertRABatch = dbInstance.transaction((reqId: string, names: string[]) => {
      for (const n of names) insertRA.run(crypto.randomUUID(), reqId, n.trim());
    });

    const insertStages = dbInstance.transaction((reqId: string, finalStage: string) => {
      insertSE.run(crypto.randomUUID(), reqId, 'new', 'Ingested from customer dataset.');
      if (['triaged', 'planned', 'in_development', 'testing', 'shipped'].includes(finalStage)) {
        insertSE.run(crypto.randomUUID(), reqId, 'triaged', 'Classified and prioritized by product team.');
      }
      if (['planned', 'in_development', 'testing', 'shipped'].includes(finalStage)) {
        insertSE.run(crypto.randomUUID(), reqId, 'planned', 'Committed to roadmap and backlog.');
      }
      if (['in_development', 'testing', 'shipped'].includes(finalStage)) {
        insertSE.run(crypto.randomUUID(), reqId, 'in_development', 'Sprint execution started by engineering.');
      }
      if (['testing', 'shipped'].includes(finalStage)) {
        insertSE.run(crypto.randomUUID(), reqId, 'testing', 'Staging build in QA testing.');
      }
      if (finalStage === 'shipped') {
        insertSE.run(crypto.randomUUID(), reqId, 'shipped', 'Deployed to production; customer validation initiated.');
      }
      if (finalStage === 'declined') {
        insertSE.run(crypto.randomUUID(), reqId, 'declined', 'Declined due to roadmap prioritization.');
      }
    });

    for (const row of rowsSeed) {
      const revNum = parseInt(row.revStr.replace(/[$,]/g, ''), 10) || 0;
      const accountNames = row.accountStr.split(',').map((s) => s.trim());
      const acctCount = accountNames.length;
      const stage = row.stageOverride || 'new';
      const priority = getPriority(revNum, row.mentions, acctCount);
      const reqId = crypto.randomUUID();
      const summary = `${acctCount} enterprise accounts requested ${row.title.toLowerCase()}. ${row.mentions} mentions. ARR impact: ${row.revStr}.`;
      const rawFeedback = `"We really need ${row.title.toLowerCase()}." - Reported by ${accountNames.slice(0, 3).join(', ')}${
        acctCount > 3 ? ` and ${acctCount - 3} more accounts` : ''
      }. Total ${row.mentions} mentions, ${acctCount} accounts, estimated revenue impact ${row.revStr}.`;

      insertReq.run(reqId, row.title, row.area, stage, row.mentions, acctCount, row.revStr, revNum, priority, rawFeedback, summary);
      insertRABatch(reqId, accountNames);
      insertStages(reqId, stage);
      if (stage === 'shipped') {
        insertCV.run(crypto.randomUUID(), reqId, 'pending');
      }
    }

    const allReqs = dbInstance.prepare('SELECT id, product_area FROM feature_requests').all() as { id: string; product_area: string }[];
    const insertRelated = dbInstance.prepare('INSERT OR IGNORE INTO related_feedback (id, request_id, related_request_id) VALUES (?, ?, ?)');
    const linkRelated = dbInstance.transaction(() => {
      for (let i = 0; i < allReqs.length; i++) {
        for (let j = i + 1; j < allReqs.length; j++) {
          if (allReqs[i].product_area === allReqs[j].product_area) {
            insertRelated.run(crypto.randomUUID(), allReqs[i].id, allReqs[j].id);
            insertRelated.run(crypto.randomUUID(), allReqs[j].id, allReqs[i].id);
          }
        }
      }
    });
    linkRelated();
  }

  return dbInstance;
}

let db: any;
try {
  db = initSqliteDatabase();
} catch (e) {
  console.error("SQLite initialization fallback error:", e);
  // Re-attempt in memory
  try {
    const Database = require('better-sqlite3');
    const memoryDb = new Database(':memory:');
    db = memoryDb;
  } catch (memErr) {
    console.error("Critical fallback:", memErr);
  }
}

export default db;