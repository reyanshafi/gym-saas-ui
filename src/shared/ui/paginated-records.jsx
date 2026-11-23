"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Records from "@/shared/ui/records";

const pageSizes = [10, 25, 50, 100];

export default function PaginatedRecords({ paginationKey, ...props }) {
  const [pageSize, setPageSize] = useState(10);
  return (
    <RecordPage
      key={paginationKey}
      {...props}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}

function RecordPage({ records, totalCount = records.length, feedback, pageSize, setPageSize, ...tableProps }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  if (currentPage !== page) setPage(currentPage);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, records.length);

  return (
    <>
      <Records {...tableProps} records={records.slice(start, end)} />
      <div className="table-footer table-pagination">
        <div>
          <span aria-live="polite">
            {records.length ? `Showing ${start + 1}–${end} of ${records.length}` : "Showing 0 records"}
            {totalCount !== records.length && ` (${totalCount} total)`}
          </span>
          {feedback != null && <span className="table-pagination-feedback" role="status">{feedback}</span>}
        </div>
        <div className="table-pagination-controls" role="group" aria-label="Table pagination">
          <label>
            Rows per page
            <select
              className="filter-select"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {pageSizes.map((size) => <option key={size}>{size}</option>)}
            </select>
          </label>
          <button className="icon-button" type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span>Page {currentPage} of {pageCount}</span>
          <button className="icon-button" type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
