-- Seed automático: cria/atualiza perfis de teste buscando por email
-- Rode APÓS criar os usuários via signup no app:
--   cliente@teste.com (senha: teste123)
--   profissional@teste.com (senha: teste123)

DO $$
DECLARE
  v_cliente_id uuid;
  v_profissional_id uuid;
BEGIN
  -- Buscar IDs dos usuários por email
  SELECT id INTO v_cliente_id FROM auth.users WHERE email = 'cliente@teste.com';
  SELECT id INTO v_profissional_id FROM auth.users WHERE email = 'profissional@teste.com';

  IF v_cliente_id IS NULL THEN
    RAISE NOTICE 'Usuário cliente@teste.com não encontrado. Faça signup primeiro.';
  ELSE
    UPDATE public.profiles
    SET display_name = 'Alex Cliente',
        role = 'patient'
    WHERE id = v_cliente_id;
    RAISE NOTICE 'Cliente atualizado: %', v_cliente_id;
  END IF;

  IF v_profissional_id IS NULL THEN
    RAISE NOTICE 'Usuário profissional@teste.com não encontrado. Faça signup primeiro.';
  ELSE
    UPDATE public.profiles
    SET display_name = 'Dra. Marina Costa',
        role = 'psychologist'
    WHERE id = v_profissional_id;

    INSERT INTO public.professional_profiles (
      id,
      presentation,
      specialties,
      registration_number,
      verification_status,
      accessibility_modalities
    ) VALUES (
      v_profissional_id,
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

    RAISE NOTICE 'Profissional atualizado: %', v_profissional_id;
  END IF;

  -- Configuração de agenda (singleton)
  INSERT INTO public.scheduler_settings (id, price_cents, duration_minutes, cancellation_notice_hours)
  VALUES (true, 15000, 50, 24)
  ON CONFLICT (id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents,
    duration_minutes = EXCLUDED.duration_minutes,
    cancellation_notice_hours = EXCLUDED.cancellation_notice_hours;

  -- Disponibilidade semanal (segunda a sexta, 9h-12h e 14h-18h)
  IF v_profissional_id IS NOT NULL THEN
    INSERT INTO public.professional_availability (professional_id, weekday, starts_at, ends_at, timezone)
    SELECT v_profissional_id, d, t.start, t.end, 'America/Sao_Paulo'
    FROM generate_series(1, 5) AS d
    CROSS JOIN LATERAL (VALUES
      ('09:00'::time, '12:00'::time),
      ('14:00'::time, '18:00'::time)
    ) AS t(start, end)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Disponibilidade criada para profissional';
  END IF;
END $$;