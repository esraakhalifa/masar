import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileForm from '@/app/components/profile/ProfileForm'

describe('ProfileForm', () => {
  it('renders the form with basic information fields', () => {
    render(<ProfileForm />)
    
    // Check if the form title is rendered
    expect(screen.getByText('Build Your Profile')).toBeInTheDocument()
    
    // Check if the basic information fields are rendered
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<ProfileForm />)
    
    // Try to submit the form without filling required fields
    const submitButton = screen.getByText('Save Profile')
    fireEvent.click(submitButton)
    
    // Check if validation errors are shown
    expect(await screen.findByText('Full name is required')).toBeInTheDocument()
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    render(<ProfileForm />)
    
    // Enter invalid email
    const emailInput = screen.getByLabelText('Email')
    await userEvent.type(emailInput, 'invalid-email')
    
    // Try to submit the form
    const submitButton = screen.getByText('Save Profile')
    fireEvent.click(submitButton)
    
    // Check if email validation error is shown
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
  })

  it('allows valid form submission', async () => {
    const consoleSpy = jest.spyOn(console, 'log')
    render(<ProfileForm />)
    
    // Fill in the form with valid data
    await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com')
    
    // Submit the form
    const submitButton = screen.getByText('Save Profile')
    fireEvent.click(submitButton)
    
    // Check if the form data was logged (since we're using console.log in the onSubmit handler)
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
}) 