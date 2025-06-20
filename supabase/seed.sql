-- Insert initial super admin user (password needs to be set via Supabase Auth)
insert into public.users (id, email, role, first_name, last_name)
values (
  '00000000-0000-0000-0000-000000000000',
  'admin@hksolution.com',
  'super_admin',
  'System',
  'Administrator'
);

-- Insert sample departments
insert into public.employees (id, department, position, hire_date)
values (
  '00000000-0000-0000-0000-000000000000',
  'Administration',
  'System Administrator',
  current_date
);

