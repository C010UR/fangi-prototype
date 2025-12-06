import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ListPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ListPagination({ page, totalPages, onPageChange }: ListPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Logic for page numbers
  const siblingCount = 2;
  const totalPageNumbers = siblingCount * 2 + 1; // 5

  let left = Math.max(page - siblingCount, 1);
  let right = Math.min(page + siblingCount, totalPages);

  // Adjust if we are near bounds to maintain 5 items if possible
  if (page <= siblingCount + 1) {
    right = Math.min(1 + totalPageNumbers - 1, totalPages);
    left = 1;
  }
  if (page >= totalPages - siblingCount) {
    left = Math.max(totalPages - totalPageNumbers + 1, 1);
    right = totalPages;
  }

  const range = [];
  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={e => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>

        {left > 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={e => {
                e.preventDefault();
                onPageChange(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {left > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {range.map(p => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={e => {
                e.preventDefault();
                onPageChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {right < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {right < totalPages && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={e => {
                e.preventDefault();
                onPageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={e => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
