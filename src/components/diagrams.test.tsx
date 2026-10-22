import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AppMock, { type MockKind } from './AppMock'
import { EventDiagram, HomeDiagram, OfficeDiagram } from './diagrams'
import UseCaseDiagram from './UseCaseDiagram'

describe('use case diagrams', () => {
  it('home diagram shows four rooms and the crossed-out Internet', () => {
    const { container } = render(<HomeDiagram />)
    for (const room of ['Living room', 'Kitchen', 'Bedroom', 'Study']) {
      expect(screen.getByText(room)).toBeInTheDocument()
    }
    expect(screen.getByText('not required')).toBeInTheDocument()
    expect(screen.getByText('Router')).toBeInTheDocument()
    expect(container.querySelectorAll('line')).toHaveLength(6)
    expect(container.querySelector('path[stroke="#dc2626"]')).toBeInTheDocument()
  })

  it('office diagram shows seven meshed computers', () => {
    const { container } = render(<OfficeDiagram />)
    expect(container.querySelectorAll('line')).toHaveLength(21)
    expect(screen.getByText('Chats never leave the local network')).toBeInTheDocument()
  })

  it('event diagram carries the offline message', () => {
    render(<EventDiagram />)
    expect(screen.getByText('Internet is not available, but chats are still possible')).toBeInTheDocument()
  })

  it.each([
    ['home', /Home network/],
    ['office', /Office network/],
    ['events', /Outdoor event/],
  ] as const)('UseCaseDiagram renders the %s diagram', (slug, name) => {
    render(<UseCaseDiagram slug={slug} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(name)
  })
})

describe('AppMock', () => {
  it.each(['host', 'join', 'topology', 'history', 'settings', 'security', 'privacy'] as MockKind[])(
    'renders the %s mock with an accessible name',
    (kind) => {
      render(<AppMock kind={kind} alt={`mock ${kind}`} />)
      expect(screen.getByRole('img', { name: `mock ${kind}` })).toBeInTheDocument()
    },
  )
})
