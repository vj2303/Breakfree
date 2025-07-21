const API_URL = 'https://api.breakfreeacademy.in/api/inbox-activities';

function getAuthToken() {
  if (typeof window === 'undefined') throw new Error('No window object');
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User not authenticated');
  return `Bearer ${token}`;
}

export async function fetchInboxActivities(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
    headers: { 'Authorization': getAuthToken() }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch inbox activities');
  }
  return res.json();
} 