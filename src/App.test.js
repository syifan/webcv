import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

const mockCvData = `
version: 1
header:
  name: "Test User"
  tags:
    - "Test Title"
  contact:
    email: "test@example.com"
sections:
  - id: test
    title: "Test Section"
    entries:
      - left:
          - "Test Entry"
        right:
          - "2024"
`;

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(mockCvData),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders CV header with name', async () => {
  render(<App />);
  await waitFor(() => {
    const nameElement = screen.getByText(/Test User/i);
    expect(nameElement).toBeInTheDocument();
  });
});

test('renders CV sections', async () => {
  render(<App />);
  await waitFor(() => {
    const sectionElement = screen.getByText(/Test Section/i);
    expect(sectionElement).toBeInTheDocument();
  });
});
