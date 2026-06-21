import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook with loading / error / refetch.
 * Usage: const { data, loading, error, refetch } = useFetch(getDashboardStats);
 */
export function useFetch(apiFn, params = {}, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(params);
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Pagination helper.
 * Usage: const { page, limit, setPage, paginationProps } = usePagination();
 */
export function usePagination(initialLimit = 10) {
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  return {
    page, limit, total, setPage, setLimit, setTotal,
    paginationProps: { page, limit, total, totalPages, setPage },
  };
}

/**
 * Confirmation dialog hook.
 * Usage: const { confirm, ConfirmModal } = useConfirm();
 *        await confirm({ title, message }) — resolves true/false.
 */
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = (opts) =>
    new Promise((resolve) => setState({ ...opts, resolve }));

  const handle = (val) => {
    state?.resolve(val);
    setState(null);
  };

  return { confirm, confirmState: state, handleConfirm: () => handle(true), handleCancel: () => handle(false) };
}
