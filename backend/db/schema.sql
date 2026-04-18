create table if not exists users (
  id uuid primary key,
  wallet_address text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists tracked_wallets (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  wallet_address text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (user_id, wallet_address)
);

create table if not exists user_settings (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  idle_hours integer not null default 24,
  price_change_pct numeric(10, 2) not null default 5.00,
  large_transaction_multiplier numeric(10, 2) not null default 3.00,
  price_drop_buy_amount numeric(18, 6) not null default 10.00,
  updated_at timestamptz not null default now()
);

create table if not exists wallet_snapshots (
  id uuid primary key,
  wallet_address text not null,
  sol_balance numeric(24, 9),
  portfolio_value_usd numeric(24, 6),
  snapshot_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key,
  wallet_address text not null,
  signature text unique not null,
  direction text,
  amount numeric(24, 9),
  mint text,
  block_time timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists signals (
  id uuid primary key,
  wallet_address text not null,
  signal_type text not null,
  severity text not null,
  title text not null,
  insight text not null,
  action_type text,
  action_payload jsonb,
  confidence_score numeric(5, 2),
  status text not null default 'active',
  detected_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists signal_dismissals (
  id uuid primary key,
  signal_id uuid not null references signals(id) on delete cascade,
  wallet_address text not null,
  dismissed_at timestamptz not null default now()
);

create table if not exists execution_intents (
  id uuid primary key,
  signal_id uuid references signals(id) on delete set null,
  wallet_address text not null,
  provider text not null,
  status text not null default 'prepared',
  request_payload jsonb,
  response_payload jsonb,
  signed_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
