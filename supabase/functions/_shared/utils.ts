export const response = (data: unknown, status: number, statusText?: string): Response => {
  if (!data) {
    new Response(null, { status, statusText });
  }
  return new Response(JSON.stringify(data, null, 2), { status });
};