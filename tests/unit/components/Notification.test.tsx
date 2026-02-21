import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Notification from '@/components/Notification'
import { useAppStore } from '@/stores/useAppStore'

describe('Notification Component', () => {
  beforeEach(() => {
    useAppStore.setState({
      notification: null,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not render when there is no notification', () => {
    render(<Notification />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders success notification with correct role', () => {
    useAppStore.setState({
      notification: {
        type: 'success',
        message: 'Saved successfully',
      },
    })

    render(<Notification />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Saved successfully')).toBeVisible()
  })

  it('renders error notification with alert role', () => {
    useAppStore.setState({
      notification: {
        type: 'error',
        message: 'Something went wrong',
      },
    })

    render(<Notification />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeVisible()
  })

  it('clears notification when close button is clicked', async () => {
    const user = userEvent.setup()

    useAppStore.setState({
      notification: {
        type: 'info',
        message: 'Information message',
      },
    })

    render(<Notification />)

    const button = screen.getByRole('button', {
      name: /close notification/i,
    })

    await user.click(button)

    expect(useAppStore.getState().notification).toBeNull()
  })

  it('auto-dismisses success notification after duration', () => {
    useAppStore.setState({
      notification: {
        type: 'success',
        message: 'Auto dismiss test',
      },
    })

    render(<Notification />)

    vi.advanceTimersByTime(4000)

    expect(useAppStore.getState().notification).toBeNull()
  })

  it('does not auto-dismiss error notifications', () => {
    useAppStore.setState({
      notification: {
        type: 'error',
        message: 'Error stays',
      },
    })

    render(<Notification />)

    vi.advanceTimersByTime(10000)

    expect(useAppStore.getState().notification).not.toBeNull()
  })

  it('pauses timer on hover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    useAppStore.setState({
      notification: {
        type: 'success',
        message: 'Hover test',
      },
    })

    render(<Notification />)

    const container = screen.getByRole('status')

    await user.hover(container)

    vi.advanceTimersByTime(4000)

    expect(useAppStore.getState().notification).not.toBeNull()
  })
})