import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LearningResources from '@/app/components/learning/LearningResources'
import type { LearningResource } from '@/app/lib/types/learning'

const mockResources: LearningResource[] = [
  {
    id: '1',
    title: 'Test Course',
    type: 'course',
    source: 'Test Source',
    url: 'https://test.com',
    description: 'Test Description',
    estimatedHours: 10,
    difficulty: 'beginner',
    skills: ['Test Skill'],
    completed: false
  }
]

describe('LearningResources', () => {
  const mockOnResourceUpdate = jest.fn()

  beforeEach(() => {
    mockOnResourceUpdate.mockClear()
  })

  it('renders the learning resources list', () => {
    render(
      <LearningResources
        resources={mockResources}
        onResourceUpdate={mockOnResourceUpdate}
      />
    )

    expect(screen.getByText('Learning Resources')).toBeInTheDocument()
    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('filters resources by type', async () => {
    render(
      <LearningResources
        resources={mockResources}
        onResourceUpdate={mockOnResourceUpdate}
      />
    )

    const typeFilter = screen.getByRole('combobox', { name: /type/i })
    await userEvent.selectOptions(typeFilter, 'course')

    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('filters resources by difficulty', async () => {
    render(
      <LearningResources
        resources={mockResources}
        onResourceUpdate={mockOnResourceUpdate}
      />
    )

    const difficultyFilter = screen.getByRole('combobox', { name: /difficulty/i })
    await userEvent.selectOptions(difficultyFilter, 'beginner')

    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('marks a resource as completed', () => {
    render(
      <LearningResources
        resources={mockResources}
        onResourceUpdate={mockOnResourceUpdate}
      />
    )

    const completeButton = screen.getByText('Mark Complete')
    fireEvent.click(completeButton)

    expect(mockOnResourceUpdate).toHaveBeenCalledWith({
      ...mockResources[0],
      completed: true
    })
  })

  it('shows resource details', () => {
    render(
      <LearningResources
        resources={mockResources}
        onResourceUpdate={mockOnResourceUpdate}
      />
    )

    expect(screen.getByText('10h')).toBeInTheDocument()
    expect(screen.getByText('beginner')).toBeInTheDocument()
    expect(screen.getByText('course')).toBeInTheDocument()
  })
}) 