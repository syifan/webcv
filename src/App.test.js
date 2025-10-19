import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

const mockYaml = `
header:
  name: "Test Person"
sections: []
`

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(mockYaml),
    })
  )

  window.scrollTo = jest.fn()
  window.print = jest.fn()
})

afterEach(() => {
  jest.resetAllMocks()
  delete global.fetch
  delete window.scrollTo
  delete window.print
})

test('renders CV header once data loads', async () => {
  render(<App />)

  expect(screen.getByRole('status')).toHaveTextContent(/loading cv/i)

  await waitFor(() =>
    expect(
      screen.getByRole('heading', { level: 1, name: /test person/i })
    ).toBeInTheDocument()
  )
})
