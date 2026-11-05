// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:rest(.*)*', component: { render: () => null } }] })

describe('vote screens in the static preview build', () => {
  it('show a notice instead of calling a server that is not there', async () => {
    vi.stubEnv('VITE_DATA_SOURCE', 'static')
    vi.resetModules()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { default: VoteCreateView } = await import('./VoteCreateView.vue')
    const { default: VoteSessionView } = await import('./VoteSessionView.vue')
    const create = mount(VoteCreateView, { global: { plugins: [router] } })
    const session = mount(VoteSessionView, { props: { id: 'x'.repeat(22) }, global: { plugins: [router] } })
    expect(create.text()).toContain('Voting needs the server')
    expect(session.text()).toContain('Voting needs the server')
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })
})
