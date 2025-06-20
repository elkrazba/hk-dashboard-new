-- Create leave request types enum
create type leave_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type leave_type as enum (
  'vacation',
  'sick',
  'personal',
  'maternity',
  'paternity',
  'bereavement',
  'unpaid'
);

-- Create leave requests table
create table public.leave_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) not null,
  leave_type leave_type not null,
  status leave_status not null default 'pending',
  start_date date not null,
  end_date date not null,
  reason text,
  approved_by uuid references public.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create performance review types enum
create type review_status as enum (
  'scheduled',
  'in_progress',
  'completed'
);

-- Create performance reviews table
create table public.performance_reviews (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) not null,
  reviewer_id uuid references public.users(id) not null,
  review_date date not null,
  status review_status not null default 'scheduled',
  overall_rating integer check (overall_rating between 1 and 5),
  strengths text[],
  areas_for_improvement text[],
  goals text[],
  comments text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create review feedback table for 360 reviews
create table public.review_feedback (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references public.performance_reviews(id) not null,
  reviewer_id uuid references public.users(id) not null,
  feedback_type text not null,
  rating integer check (rating between 1 and 5),
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.leave_requests enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.review_feedback enable row level security;

-- RLS Policies for leave_requests
create policy "Employees can view their own leave requests"
  on public.leave_requests
  for select
  using (employee_id = auth.uid());

create policy "HR and managers can view all leave requests"
  on public.leave_requests
  for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'hr_admin')
    )
  );

create policy "HR and managers can manage leave requests"
  on public.leave_requests
  for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'hr_admin')
    )
  );

-- RLS Policies for performance_reviews
create policy "Employees can view their own reviews"
  on public.performance_reviews
  for select
  using (employee_id = auth.uid());

create policy "Reviewers can view and update assigned reviews"
  on public.performance_reviews
  for all
  using (reviewer_id = auth.uid());

create policy "HR and managers can manage all reviews"
  on public.performance_reviews
  for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('super_admin', 'hr_admin')
    )
  );

-- Add audit triggers
create trigger leave_requests_audit
  after insert or update or delete on public.leave_requests
  for each row execute function audit_log_changes();

create trigger performance_reviews_audit
  after insert or update or delete on public.performance_reviews
  for each row execute function audit_log_changes();

create trigger review_feedback_audit
  after insert or update or delete on public.review_feedback
  for each row execute function audit_log_changes();

-- Create indexes
create index leave_requests_employee_id_idx on public.leave_requests(employee_id);
create index leave_requests_status_idx on public.leave_requests(status);
create index performance_reviews_employee_id_idx on public.performance_reviews(employee_id);
create index performance_reviews_reviewer_id_idx on public.performance_reviews(reviewer_id);
create index performance_reviews_status_idx on public.performance_reviews(status);

