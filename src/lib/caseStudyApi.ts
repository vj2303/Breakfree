const API_URL = 'http://localhost:3000/api/case-studies';

function getAuthToken() {
  if (typeof window === 'undefined') throw new Error('No window object');
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User not authenticated');
  return `Bearer ${token}`;
}

export async function createCaseStudy(data: any) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthToken(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create case study');
  }
  return res.json();
}

export async function fetchCaseStudies(page = 1, limit = 10) {
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
    headers: { 'Authorization': getAuthToken() }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch case studies');
  }
  return res.json();
}

export async function updateCaseStudy(id: string, data: any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthToken(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update case study');
  }
  return res.json();
}

export async function deleteCaseStudy(id: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': getAuthToken() }
  });
  if (!res.ok) {
    throw new Error('Failed to delete case study');
  }
  return res.json();
} 