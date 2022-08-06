import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination pageInfo={{ page: 1, pages: 1 }} onPageChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('marks the current page and disables the edges', async () => {
    const onPageChange = vi.fn();
    render(<Pagination pageInfo={{ page: 1, pages: 3 }} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
