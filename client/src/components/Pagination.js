import { useMemo } from "react";
import { per_page } from "../constants/jobConstants";

const Pagination = ({ pageInfo, setPage }) => {
  const { count } = pageInfo
  const page = parseInt(pageInfo.page)
  const pages = useMemo(() => Math.ceil(count / per_page), [count])

  const prev = page - 1 > 0;
  const next = page + 1 <= pages;

  const onPageChange = (type) => {
    if (type === 'next') return next && setPage(page + 1)
    if (type === 'prev') return prev && setPage(page - 1)

    setPage(type)
  };

  return (
    <div
      className="d-flex justify-content-center"
      style={{ marginTop: "1rem" }}
    >
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          {prev &&
            <li className="page-item">
              <a className="page-link" onClick={() => onPageChange("prev")}>
                Previous
              </a>
            </li>
          }
          {[...Array(pages)].map((el, index) => (
            <li key={index.toString} className={`page-item ${index + 1 === page ? "active" : null}`}>
              <a
                className="page-link"
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </a>
            </li>
          ))}
          {next &&
            <li className="page-item">
              <a className="page-link" onClick={() => onPageChange("next")}>
                Next
              </a>
            </li>
          }
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
