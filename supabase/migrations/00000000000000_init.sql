-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create enum types
create type user_role as enum (
  'super_admin',
  'hr_admin',
  'project_manager',
  'team_lead',
  'employee',
  'intern',
  'partner'
);

create type project_status as enum (
  'idea',
  'development',
  'beta',
  'live',
  'maintenance'
);

create type employee_status as enum (
  'active',
  'inactive',
  'on_leave'
);

-- Create users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) primary key,
  email text not null unique,
  role user_role not null default 'employee'::user_role,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create employees table
create table public.employees (
  id uuid references public.users(id) primary key,
  department text not null,
  position text not null,
  hire_date date not null,
  reports_to uuid references public.employees(id),
  salary numeric(10,2),
  status employee_status not null default 'active'::employee_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status project_status not null default 'idea'::project_status,
  description text,
  start_date date not null,
  end_date date,
  lead_id uuid references public.users(id) not null,
  budget numeric(12,2),
  revenue numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create project_members junction table
create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- Create audit_logs table
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.audit_logs enable row level security;

-- Create RLS Policies

-- Users policies
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

create policy "HR admins can view all profiles"
  on public.users
  for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'hr_admin')
    )
  );

create policy "HR admins can update profiles"
  on public.users
  for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'hr_admin')
    )
  );

-- Employees policies
create policy "Employees can view their own record"
  on public.employees
  for select
  using (auth.uid() = id);

create policy "HR admins can manage all employee records"
  on public.employees
  for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'hr_admin')
    )
  );

-- Projects policies
create policy "Project members can view their projects"
  on public.projects
  for select
  using (
    exists (
      select 1 from public.project_members
      where project_id = id
      and user_id = auth.uid()
    )
  );

create policy "Project leads can update their projects"
  on public.projects
  for update
  using (lead_id = auth.uid());

create policy "Project managers and admins can manage all projects"
  on public.projects
  for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'project_manager')
    )
  );

-- Create triggers for audit logging
create or replace function audit_log_changes()
returns trigger as $$
begin
  insert into public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  )
  values (
    TG_TABLE_NAME,
    case
      when TG_OP = 'DELETE' then old.id
      else new.id
    end,
    TG_OP,
    case
      when TG_OP = 'INSERT' then null
      else to_jsonb(old)
    end,
    case
      when TG_OP = 'DELETE' then null
      else to_jsonb(new)
    end,
    auth.uid()
  );
  return null;
end;
$$ language plpgsql security definer;

create trigger users_audit
  after insert or update or delete on public.users
  for each row execute function audit_log_changes();

create trigger employees_audit
  after insert or update or delete on public.employees
  for each row execute function audit_log_changes();

create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function audit_log_changes();

-- Create indexes for better performance
create index users_role_idx on public.users(role);
create index employees_department_idx on public.employees(department);
create index employees_reports_to_idx on public.employees(reports_to);
create index projects_status_idx on public.projects(status);
create index projects_lead_id_idx on public.projects(lead_id);

