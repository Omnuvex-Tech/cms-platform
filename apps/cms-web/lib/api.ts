const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' 
    ? document.cookie.split('access_token=')[1]?.split(';')[0] 
    : '';

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}