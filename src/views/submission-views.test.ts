// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdminView from './AdminView.vue'
import SubmitView from './SubmitView.vue'

type Route = { method: string; path: string; status?: number; body: unknown }

const stubServer = (routes: Route[]) => {
  const calls: { method: string; path: string; body: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string, init: RequestInit = {}) => {
      const method = init.method ?? 'GET'
      calls.push({ method, path, body: init.body === undefined ? undefined : JSON.parse(String(init.body)) })
      const route = routes.find((candidate) => candidate.method === method && candidate.path === path)
      return new Response(JSON.stringify(route?.body ?? { error: 'Not found' }), { status: route?.status ?? (route ? 200 : 404) })
    }),
  )
  return calls
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const advance = async (): Promise<void> => {
  await vi.advanceTimersByTimeAsync(1600)
  await flushPromises()
}

describe('SubmitView', () => {
  const fill = async (wrapper: ReturnType<typeof mount>, link: string) => {
    await wrapper.find('input').setValue(link)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  it('shows the form, then progress, then the pending message', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    stubServer([{ method: 'POST', path: '/api/submissions', status: 202, body: { id, status: 'queued' } }])
    const wrapper = mount(SubmitView)
    expect(wrapper.find('label').text()).toBe('Recipe link')
    await fill(wrapper, 'https://example.com/soup')
    expect(wrapper.text()).toContain('Waiting for its turn')
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)

    stubServer([{ method: 'GET', path: `/api/submissions/${id}`, body: { id, status: 'translating' } }])
    await advance()
    expect(wrapper.text()).toContain('Translating')

    stubServer([{ method: 'GET', path: `/api/submissions/${id}`, body: { id, status: 'pending' } }])
    await advance()
    expect(wrapper.text()).toContain('waiting for approval')
  })

  it('shows the reason when the import fails and lets the visitor start over', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    stubServer([{ method: 'POST', path: '/api/submissions', status: 202, body: { id, status: 'queued' } }])
    const wrapper = mount(SubmitView)
    await fill(wrapper, 'https://example.com/soup')
    stubServer([{ method: 'GET', path: `/api/submissions/${id}`, body: { id, status: 'failed', reason: 'The page took too long to load' } }])
    await advance()
    expect(wrapper.text()).toContain('could not be imported')
    expect(wrapper.text()).toContain('The page took too long to load')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('shows a refused link next to the field', async () => {
    stubServer([{ method: 'POST', path: '/api/submissions', status: 409, body: { error: 'This link was already submitted' } }])
    const wrapper = mount(SubmitView)
    await fill(wrapper, 'https://example.com/soup')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('This link was already submitted')
  })

  it('does not send an empty link', () => {
    const wrapper = mount(SubmitView)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('shows a notice instead of the form in the static preview build', () => {
    vi.stubEnv('VITE_DATA_SOURCE', 'static')
    const wrapper = mount(SubmitView)
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('not available in this preview')
  })
})

describe('AdminView', () => {
  const pending = [
    {
      id: '22222222-2222-4222-8222-222222222222',
      url: 'https://example.com/soup',
      translated: false,
      recipe: {
        slug: 'soup',
        cuisine: 'Italian',
        difficulty: 'Easy',
        languages: { en: { title: 'Soup', ingredients: ['tomato'], steps: [{ content: 'Simmer.', image: '' }] } },
      },
    },
  ]

  it('says admin is off when the server has no token', async () => {
    stubServer([{ method: 'GET', path: '/api/admin/session', body: { enabled: false, signedIn: false } }])
    const wrapper = mount(AdminView)
    await flushPromises()
    expect(wrapper.text()).toContain('switched off')
  })

  it('signs in, previews a pending recipe and approves it', async () => {
    const calls = stubServer([
      { method: 'GET', path: '/api/admin/session', body: { enabled: true, signedIn: false } },
      { method: 'POST', path: '/api/admin/session', body: { signedIn: true } },
      { method: 'GET', path: '/api/admin/submissions', body: pending },
      { method: 'POST', path: `/api/admin/submissions/${pending[0].id}/approve`, body: { id: pending[0].id, status: 'published' } },
    ])
    const wrapper = mount(AdminView)
    await flushPromises()
    await wrapper.find('input').setValue('the-token')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Soup')
    expect(wrapper.text()).toContain('Not translated')
    expect(wrapper.text()).toContain('tomato')
    expect(wrapper.find('input').exists()).toBe(false)

    const approve = wrapper.findAll('button').find((button) => button.text() === 'Approve')
    await approve?.trigger('click')
    await flushPromises()
    expect(calls.at(-1)).toMatchObject({ method: 'POST', path: `/api/admin/submissions/${pending[0].id}/approve` })
    expect(wrapper.text()).toContain('Nothing is waiting for approval')
  })

  it('shows the sign in error and keeps the form', async () => {
    stubServer([
      { method: 'GET', path: '/api/admin/session', body: { enabled: true, signedIn: false } },
      { method: 'POST', path: '/api/admin/session', status: 401, body: { error: 'Wrong token' } },
    ])
    const wrapper = mount(AdminView)
    await flushPromises()
    await wrapper.find('input').setValue('nope')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Wrong token')
    expect(wrapper.find('input').exists()).toBe(true)
  })
})
