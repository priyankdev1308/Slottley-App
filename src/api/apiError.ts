// This backend returns HTTP 200 even for logical failures (e.g. "invalid
// password"), signalling success/failure via the JSON body itself. Axios
// won't reject on its own here, so callers must check explicitly.
export const extractApiError = (data: any): string | null => {
  if (!data || typeof data !== 'object') return null;
  const successFlag = data.status ?? data.Status ?? data.success ?? data.Success;
  const isFailure =
    successFlag === false ||
    successFlag === 0 ||
    successFlag === '0' ||
    successFlag === 'false';
  if (!isFailure) return null;
  return (
    data.msg ||
    data.message ||
    data.Message ||
    data.error ||
    'Something went wrong. Please try again.'
  );
};
