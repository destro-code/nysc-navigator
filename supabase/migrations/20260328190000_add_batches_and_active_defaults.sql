-- Add first-class NYSC batches model
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  batch TEXT NOT NULL,
  stream TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  start_date DATE,
  end_date DATE,
  registration_open BOOLEAN NOT NULL DEFAULT false,
  camp_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT batches_year_check CHECK (year >= 2000)
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Only one active batch can exist at any point in time
CREATE UNIQUE INDEX idx_batches_single_active
  ON public.batches (is_active)
  WHERE is_active = true;

CREATE POLICY "Public can read active batch"
ON public.batches
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can insert batches"
ON public.batches
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update batches"
ON public.batches
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete batches"
ON public.batches
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_batches_active_year_batch
  ON public.batches(is_active, year DESC, batch, stream);

-- Seed one active row to support existing clients
INSERT INTO public.batches (
  year,
  batch,
  stream,
  is_active,
  registration_open
)
VALUES (2024, 'C', 'Stream I', true, false)
ON CONFLICT DO NOTHING;

-- Ensure new profiles default to active batch metadata when present
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  active_batch_record public.batches%ROWTYPE;
BEGIN
  SELECT *
  INTO active_batch_record
  FROM public.batches
  WHERE is_active = true
  LIMIT 1;

  INSERT INTO public.profiles (user_id, username, batch, stream)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Corper'),
    CASE
      WHEN active_batch_record.id IS NOT NULL
      THEN active_batch_record.year::text || ' Batch ' || active_batch_record.batch
      ELSE '2024 Batch A'
    END,
    COALESCE(active_batch_record.stream, 'Stream I')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
