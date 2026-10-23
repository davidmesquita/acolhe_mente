import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}))
vi.mock('../../src/lib/supabaseClient', () => ({ requireSupabase: () => ({ auth: mocks }) }))

import {
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '../../src/features/auth/authService'

describe('serviços de autenticação Supabase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cadastra sem permitir escolher papel', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'test-user' }, session: null },
      error: null,
    })
    await signUp(' paciente@example.test ', 'senha-teste-123', ' Pessoa Teste ')
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'paciente@example.test',
      password: 'senha-teste-123',
      options: { data: { display_name: 'Pessoa Teste' } },
    })
    expect(JSON.stringify(mocks.signUp.mock.calls)).not.toContain('role')
  })

  it('faz login com senha', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-user' }, session: {} },
      error: null,
    })
    await signIn('user@example.test', 'senha-teste-123')
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.test',
      password: 'senha-teste-123',
    })
  })

  it('encerra a sessão', async () => {
    mocks.signOut.mockResolvedValue({ error: null })
    await signOut()
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })

  it('solicita recuperação por e-mail com rota de retorno', async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null })
    await requestPasswordReset('user@example.test')
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('user@example.test', {
      redirectTo: '/recuperar-senha',
    })
  })

  it('atualiza senha na sessão de recuperação', async () => {
    mocks.updateUser.mockResolvedValue({ error: null })
    await updatePassword('senha-nova-teste')
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'senha-nova-teste' })
  })

  it('propaga falhas do serviço sem registrar dados', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Credenciais inválidas'),
    })
    await expect(signIn('user@example.test', 'senha-teste-123')).rejects.toThrow(
      'Credenciais inválidas',
    )
  })
})
