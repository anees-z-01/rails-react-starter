const Pagination = ({ pageInfo, onPageChange }) => {
  const { page, pages } = pageInfo;
  if (!pages || pages < 2) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="button button--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <ol>
        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
          <li key={number}>
            <button
              type="button"
              className="pagination__page"
              aria-current={number === page ? 'page' : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="button button--ghost" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
};

export default Pagination;
