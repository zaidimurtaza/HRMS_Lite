create table public.employees (
  id serial not null,
  full_name text not null,
  email text not null,
  department text not null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  employee_id text GENERATED ALWAYS as (('EMP'::text || lpad((id)::text, 3, '0'::text))) STORED null,
  constraint employees_pkey primary key (id),
  constraint employees_email_key unique (email),
  constraint employees_employee_id_key unique (employee_id)
) TABLESPACE pg_default;

create index IF not exists idx_employees_email on public.employees using btree (email) TABLESPACE pg_default;

create trigger update_employees_updated_at BEFORE
update on employees for EACH row
execute FUNCTION update_updated_at_column ();




create table public.attendance (
  id serial not null,
  employee_id text not null,
  date date not null,
  status text not null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint attendance_pkey primary key (id),
  constraint unique_attendance unique (employee_id, date),
  constraint attendance_employee_id_fkey foreign KEY (employee_id) references employees (employee_id) on delete CASCADE,
  constraint attendance_status_check check (
    (
      status = any (array['Present'::text, 'Absent'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_attendance_employee_id on public.attendance using btree (employee_id) TABLESPACE pg_default;

create index IF not exists idx_attendance_date on public.attendance using btree (date) TABLESPACE pg_default;

create trigger update_attendance_updated_at BEFORE
update on attendance for EACH row
execute FUNCTION update_updated_at_column ();