-- accounts
create table accounts (
  id text primary key,
  name text,
  industry text,
  region text,
  tier text
);

-- requests
create table requests (
  id uuid primary key default gen_random_uuid(),
  source_type text,
  raw_text text,
  item_type text,
  title text,
  summary text,
  account_id text references accounts(id),
  product_area text,
  owning_team text,
  stage text,
  dev_substage text,
  demo_given boolean default false,
  customer_tried_shipped boolean default false,
  linked_new_request_id uuid references requests(id),
  needs_review boolean default false,
  created_at timestamptz default now()
);

-- stage_events
create table stage_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  stage text,
  entered_at timestamptz default now(),
  note text
);

-- bugs
create table bugs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  substage text,
  description text,
  created_at timestamptz default now()
);

-- feedback
create table feedback (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  raw_text text,
  classification text,
  created_at timestamptz default now()
);

-- watchers
create table watchers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  name text, 
  team text, 
  notify_on_stage_change boolean default true
);

-- agent_runs
create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  input text,
  output text,
  reasoning text,
  confidence text,
  action_taken text,
  created_at timestamptz default now()
);
