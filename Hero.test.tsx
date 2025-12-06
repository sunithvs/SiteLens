import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Hero } from './src/components/landing/Hero';

// Mock useRouter
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        prefetch: vi.fn(),
    }),
}));

describe('Hero Component', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('validates valid URL and navigates', async () => {
        render(<Hero />);
        const input = screen.getByPlaceholderText(/Enter your website URL/i);
        const button = screen.getByText('Scan');

        fireEvent.change(input, { target: { value: 'example.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/site/https%3A%2F%2Fexample.com');
        });
    });

    it('validates invalid URL format', async () => {
        render(<Hero />);
        const input = screen.getByPlaceholderText(/Enter your website URL/i);
        const button = screen.getByText('Scan');

        fireEvent.change(input, { target: { value: 'not-a-url' } });
        fireEvent.click(button);

        await screen.findByText(/Please enter a valid website URL/i);
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('handles http prefix correctly', async () => {
        render(<Hero />);
        const input = screen.getByPlaceholderText(/Enter your website URL/i);
        const button = screen.getByText('Scan');

        fireEvent.change(input, { target: { value: 'http://test.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/site/http%3A%2F%2Ftest.com');
        });
    });
});
