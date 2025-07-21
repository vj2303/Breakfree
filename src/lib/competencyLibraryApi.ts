const API_URL = 'https://api.breakfreeacademy.in/api/competency-libraries';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY2ZDc5NGU3OGJiM2VmZjc2Mzc1YWYiLCJpYXQiOjE3NTE1NzAzMjgsImV4cCI6MTc1MjE3NTEyOH0.4qIQk1NGkzsxaGUDmySQBb_Gj6c2qjSs4SNdgCKfpTs';

export async function fetchCompetencyLibraries(search = '') {
  const res = await fetch(`${API_URL}?page=1&limit=10&search=${encodeURIComponent(search)}`, {
    headers: { Authorization: AUTH_TOKEN }
  });
  return res.json();
}

export async function createCompetencyLibrary(competencyName: string, subCompetencyNames: string[]) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_TOKEN
    },
    body: JSON.stringify({ competencyName, subCompetencyNames })
  });
  return res.json();
}

export async function updateCompetencyLibrary(id: string, competencyName: string, subCompetencyNames: string[]) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_TOKEN
    },
    body: JSON.stringify({ competencyName, subCompetencyNames })
  });
  return res.json();
}

export async function deleteCompetencyLibrary(id: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: AUTH_TOKEN }
  });
  return res.json();
} 