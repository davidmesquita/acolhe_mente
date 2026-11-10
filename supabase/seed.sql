-- Seed para criar perfis de teste (cliente e profissional)
-- IMPORTANTE: Crie os usuários via signup no app ANTES de rodar este seed
-- Emails sugeridos:
--   cliente@teste.com (senha: teste123)
--   profissional@teste.com (senha: teste123)
--
-- Depois do signup, copie os IDs dos usuários em auth.users e substitua abaixo

-- ============================================
-- SUBSTITUA ESTES UUIDs PELOS IDs REAIS DOS USUÁRIOS CRIADOS
-- ============================================
\set cliente_id '00000000-0000-0000-0000-000000000001'
\set profissional_id '00000000-0000-0000-0000-000000000002'

-- ============================================
-- PERFIL DO CLIENTE (patient)
-- ============================================
UPDATE public.profiles
SET display_name = 'Alex Cliente',
    role = 'patient'
WHERE id = :'cliente_id';

-- ============================================
-- PERFIL DO PROFISSIONAL (psychologist)
-- ============================================
UPDATE public.profiles
SET display_name = 'Dra. Marina Costa',
    role = 'psychologist'
WHERE id = :'profissional_id';

INSERT INTO public.professional_profiles (
  id,
  presentation,
  specialties,
  registration_number,
  verification_status,
  accessibility_modalities
) VALUES (
  :'profissional_id',
  'Psicóloga clínica com 10 anos de experiência em terapia cognitivo-comportamental e abordagem humanista. Atendimento acolhedor para ansiedade, depressão, relacionamentos e autoconhecimento.',
  ARRAY['Ansiedade', 'Depressão', 'Terapia Cognitivo-Comportamental', 'Relacionamentos'],
  'CRP 06/123456',
  'verified',
  ARRAY['Legendas em tempo real', 'Comunicação por texto']
)
ON CONFLICT (id) DO UPDATE SET
  presentation = EXCLUDED.presentation,
  specialties = EXCLUDED.specialties,
  registration_number = EXCLUDED.registration_number,
  verification_status = EXCLUDED.verification_status,
  accessibility_modalities = EXCLUDED.accessibility_modalities;

-- ============================================
-- CONFIGURAÇÃO DE AGENDA DO PROFISSIONAL
-- ============================================
INSERT INTO public.scheduler_settings (id, price_cents, duration_minutes, cancellation_notice_hours)
VALUES (true, 15000, 50, 24)
ON CONFLICT (id) DO UPDATE SET
  price_cents = EXCLUDED.price_cents,
  duration_minutes = EXCLUDED.duration_minutes,
  cancellation_notice_hours = EXCLUDED.cancellation_notice_hours;

-- Disponibilidade semanal (segunda a sexta, 9h-12h e 14h-18h)
INSERT INTO public.professional_availability (professional_id, weekday, starts_at, ends_at, timezone)
VALUES
  (:'profissional_id', 1, '09:00', '12:00', 'America/Sao_Paulo'),
  (:'profissional_id', 1, '14:00', '18:00', 'America/Sao_Paulo'),
  (:'profissional_id', 2, '09:00', '12:00', 'America/Sao_Paulo'),
  (:'profissional_id', 2, '14:00', '18:00', 'America/Sao_Paulo'),
  (:'profissional_id', 3, '09:00', '12:00', 'America/Sao_Paulo'),
  (:'profissional_id', 3, '14:00', '18:00', 'America/Sao_Paulo'),
  (:'profissional_id', 4, '09:00', '12:00', 'America/Sao_Paulo'),
  (:'profissional_id', 4, '14:00', '18:00', 'America/Sao_Paulo'),
  (:'profissional_id', 5, '09:00', '12:00', 'America/Sao_Paulo'),
  (:'profissional_id', 5, '14:00', '18:00', 'America/Sao_Paulo')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMO USAR:
-- 1. No app, faça signup com cliente@teste.com / teste123
-- 2. No app, faça signup com profissional@teste.com / teste123
-- 3. No Supabase Dashboard > Table Editor > auth.users, copie os IDs
-- 4. Substitua os UUIDs acima (cliente_id, profissional_id)
-- 5. Rode este SQL no Supabase Dashboard > SQL Editor