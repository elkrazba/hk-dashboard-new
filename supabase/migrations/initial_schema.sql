-- INITIAL SCHEMA FOR HK SOULUTION DASHBOARD
-- This file contains the initial database schema for the HK SOULUTION dashboard

-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up schemas
CREATE SCHEMA IF NOT EXISTS private;

--------------------------------------------------------------------------------
-- USERS AND AUTHENTICATION
--------------------------------------------------------------------------------

-- User Roles Table
-- Stores the roles assigned to users
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN (
    'superadmin', 'hr_admin', 'project_manager', 'team_lead', 'employee', 'intern', 'partner'
  )),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);

-- Set up RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('superadmin', 'hr_admin')
    )
  );

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('superadmin', 'hr_admin')
    )
  );

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('superadmin', 'hr_admin')
    )
  );

-- Trigger to update updated_at on user_roles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

--------------------------------------------------------------------------------
-- EMPLOYEES
--------------------------------------------------------------------------------

-- Departments Table
-- Stores company departments and their hierarchies
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.departments(id),
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (name)
);

CREATE INDEX idx_departments_parent_id ON public.departments (parent_id);
CREATE INDEX idx_departments_manager_id ON public.departments (manager_id);

-- Employees Table
-- Stores detailed information about employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(100),
  employment_type VARCHAR(50) CHECK (employment_type IN (
    'full_time', 'part_time', 'contract', 'intern', 'consultant'
  )),
  hire_date DATE,
  birth_date DATE,
  phone VARCHAR(50),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  manager_id UUID REFERENCES public.employees(id),
  salary DECIMAL(12, 2),
  salary_currency VARCHAR(3) DEFAULT 'USD',
  tax_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX idx_employees_user_id ON public.employees (user_id);
CREATE INDEX idx_employees_department_id ON public.employees (department_id);
CREATE INDEX idx_employees_manager_id ON public.employees (manager_id);
CREATE INDEX idx_employees_name ON public.employees (last_name, first_name);

-- Attendance Table
-- Tracks employee attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'present' CHECK (status IN (
    'present', 'absent', 'late', 'half_day', 'leave'
  )),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_employee_id ON public.attendance (employee_id);
CREATE INDEX idx_attendance_date ON public.attendance (date);

-- Leave Table
-- Tracks employee leaves and time off
CREATE TABLE public.leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) CHECK (leave_type IN (
    'annual', 'sick', 'maternity', 'paternity', 'unpaid', 'bereavement', 'other'
  )),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'cancelled'
  )),
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_leaves_employee_id ON public.leaves (employee_id);
CREATE INDEX idx_leaves_date_range ON public.leaves (start_date, end_date);
CREATE INDEX idx_leaves_status ON public.leaves (status);

--------------------------------------------------------------------------------
-- PROJECTS
--------------------------------------------------------------------------------

-- Projects Table
-- Stores information about company projects and brands
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN (
    'idea', 'planning', 'development', 'beta', 'launched', 'maintenance', 'completed', 'archived'
  )),
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  manager_id UUID REFERENCES auth.users(id),
  department_id UUID REFERENCES public.departments(id),
  budget DECIMAL(15, 2),
  budget_currency VARCHAR(3) DEFAULT 'USD',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (name),
  CHECK (target_end_date >= start_date),
  CHECK (actual_end_date >= start_date)
);

CREATE INDEX idx_projects_status ON public.projects (status);
CREATE INDEX idx_projects_manager_id ON public.projects (manager_id);
CREATE INDEX idx_projects_department_id ON public.projects (department_id);

-- Project Team Members Table
-- Links users to projects they're working on
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN (
    'lead', 'member', 'observer', 'client', 'partner'
  )),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON public.project_members (project_id);
CREATE INDEX idx_project_members_user_id ON public.project_members (user_id);

-- Project Milestones Table
-- Tracks key project milestones
CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'delayed', 'cancelled'
  )),
  completion_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_milestones_project_id ON public.project_milestones (project_id);
CREATE INDEX idx_project_milestones_due_date ON public.project_milestones (due_date);
CREATE INDEX idx_project_milestones_status ON public.project_milestones (status);

--------------------------------------------------------------------------------
-- DOCUMENTS AND ASSETS
--------------------------------------------------------------------------------

-- Documents Table
-- Stores metadata about uploaded documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  document_type VARCHAR(50) CHECK (document_type IN (
    'contract', 'proposal', 'report', 'presentation', 'design', 'brand_asset', 'legal', 'other'
  )),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  version VARCHAR(20) DEFAULT '1.0',
  is_public BOOLEAN DEFAULT FALSE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_project_id ON public.documents (project_id);
CREATE INDEX idx_documents_department_id ON public.documents (department_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents (uploaded_by);
CREATE INDEX idx_documents_document_type ON public.documents (document_type);
CREATE INDEX idx_documents_title_trgm ON public.documents USING GIN (title gin_trgm_ops);

-- Document Access Table
-- Controls who can access specific documents
CREATE TABLE public.document_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN (
    'read', 'edit', 'owner'
  )),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  CHECK (user_id IS NOT NULL OR department_id IS NOT NULL)
);

CREATE INDEX idx_document_access_document_id ON public.document_access (document_id);
CREATE INDEX idx_document_access_user_id ON public.document_access (user_id);
CREATE INDEX idx_document_access_department_id ON public.document_access (department_id);

--------------------------------------------------------------------------------
-- ACTIVITIES AND NOTIFICATIONS
--------------------------------------------------------------------------------

-- Activities Table
-- Tracks all user activities in the system
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50), -- e.g., 'project', 'document', 'employee'
  entity_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON public.activities (user_id);
CREATE INDEX idx_activities_activity_type ON public.activities (activity_type);
CREATE INDEX idx_activities_entity ON public.activities (entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON public.activities (created_at);

-- Notifications Table
-- Stores notifications for users
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  notification_type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = $1;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = $1;
  RETURN user_role IN ('superadmin', 'hr_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is a member of a project
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = $1 AND user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is a project manager
CREATE OR REPLACE FUNCTION public.is_project_manager(project_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = $1 AND manager_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Departments RLS policies
CREATE POLICY "Everyone can view departments"
  ON public.departments
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert departments"
  ON public.departments
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update departments"
  ON public.departments
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete departments"
  ON public.departments
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Employees RLS policies
CREATE POLICY "Employees can view their own record"
  ON public.employees
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins and team leads can view all employees"
  ON public.employees
  FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('superadmin', 'hr_admin', 'team_lead')
  );

CREATE POLICY "Project managers can view project team members"
  ON public.employees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.projects p ON pm.project_id = p.id
      WHERE pm.user_id = employees.user_id
      AND p.manager_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert employees"
  ON public.employees
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update employees"
  ON public.employees
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete employees"
  ON public.employees
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Projects RLS policies
CREATE POLICY "Users can view public projects"
  ON public.projects
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view projects they are members of"
  ON public.projects
  FOR SELECT
  USING (public.is_project_member(id, auth.uid()));

CREATE POLICY "Admins can view all projects"
  ON public.projects
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Project managers and admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('superadmin', 'hr_admin', 'project_manager')
  );

CREATE POLICY "Project managers can update their projects"
  ON public.projects
  FOR UPDATE
  USING (
    manager_id = auth.uid() OR public.is_admin(auth.uid())
  );

CREATE POLICY "Only admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Documents RLS policies
CREATE POLICY "Users can view public documents"
  ON public.documents
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view documents they have access to"
  ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_access
      WHERE document_id = documents.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view documents of their department"
  ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_access da
      JOIN public.employees e ON e.department_id = da.department_id
      WHERE da.document_id = documents.id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view documents of their projects"
  ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = documents.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update documents they uploaded"
  ON public.documents
  FOR UPDATE
  USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins and uploaders can delete documents"
  ON public.documents
  FOR DELETE
  USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

-- Notifications RLS policies
CREATE POLICY "Users can only view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid());

--------------------------------------------------------------------------------
-- TRIGGERS FOR LOGGING AND AUDIT
--------------------------------------------------------------------------------

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activities (
    user_id,
    activity_type,
    description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_ARGV[1],
    TG_ARGV[2],
    NEW.id,
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE TRIGGER log_project_insert
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE PROCEDURE log_activity('project_created', 'Project created', 'project');

CREATE TRIGGER log_project_update
AFTER UPDATE ON public.projects
FOR EACH ROW
EXECUTE PROCEDURE log_activity('project_updated', 'Project updated', 'project');

CREATE TRIGGER log_document_insert
AFTER INSERT ON public.documents
FOR EACH ROW
EXECUTE PROCEDURE log_activity('document_uploaded', 'Document uploaded', 'document');

-- Function to set up initial superadmin
CREATE OR REPLACE FUNCTION create_initial_superadmin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user being created
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    -- Insert superadmin role for the first user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
    
    -- Add to employees table
    INSERT INTO public.employees (
      user_id,
      first_name,
      last_name,
      job_title
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'Super'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'Admin'),
      'Administrator'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create initial superadmin
CREATE TRIGGER create_initial_superadmin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE create_initial_superadmin();

