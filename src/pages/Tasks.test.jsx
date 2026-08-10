import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TasksPage from './Tasks';

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ status: 200, data: { data: { tasks: [] } } }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../components/Spinner', () => ({
  default: () => React.createElement('div', null, 'Loading'),
}));

vi.mock('../components/TaskCard', () => ({
  default: ({ task }) => React.createElement('div', null, task.title),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    section: ({ children, ...props }) => React.createElement('section', props, children),
    article: ({ children, ...props }) => React.createElement('article', props, children),
  },
  AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
}));

describe('TasksPage', () => {
  it('renders the task manager hero and form heading', async () => {
    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Task Manager REST API/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
  });
});
