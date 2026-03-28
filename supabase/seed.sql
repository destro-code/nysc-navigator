-- Seed data is intentionally gated to non-production environments.
-- To run seeds, set: ALTER DATABASE postgres SET app.environment = 'development';

DO $$
DECLARE
  app_env TEXT := LOWER(COALESCE(current_setting('app.environment', true), ''));
  demo_user_id UUID;
BEGIN
  IF app_env = '' OR app_env = 'production' THEN
    RAISE NOTICE 'Skipping seed data. app.environment is "%"', COALESCE(app_env, '<null>');
    RETURN;
  END IF;

  INSERT INTO public.users (username, email, display_name)
  VALUES ('demo_user', 'demo@example.com', 'Demo User')
  ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
  RETURNING id INTO demo_user_id;

  INSERT INTO public.profiles (user_id, bio, state_code, lga, ppa_name, nysc_batch)
  VALUES (demo_user_id, 'Demo profile for local/staging only.', 'LA', 'Ikeja', 'Demo PPA', '2026 Batch A')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.roles (user_id, name)
  VALUES (demo_user_id, 'user')
  ON CONFLICT (user_id, name) DO NOTHING;

  INSERT INTO public.posts (user_id, title, body)
  VALUES (demo_user_id, 'Welcome post', 'Seeded post available in non-production environments only.')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.notifications (user_id, notification_type, title, body)
  VALUES (demo_user_id, 'system', 'Welcome', 'This seeded notification should not appear in production.')
  ON CONFLICT DO NOTHING;
END $$;
