import { MOCK_USERS, MOCK_PROJECTS } from '../constants/mockData';

const USERS_KEY = 'universe_users';
const PROJECTS_KEY = 'universe_projects';

// Initialize data on first load
export const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(PROJECTS_KEY)) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(MOCK_PROJECTS));
  }
};

// Users
export const getUsers = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getUserById = (id) => {
  const users = getUsers();
  return users.find(u => u.id === parseInt(id));
};

export const saveUser = (updatedUser) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Projects
export const getProjects = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
};

export const saveProject = (project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
  } else {
    // New project, unshift to top
    projects.unshift(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

// Reset Database for testing
export const resetStorage = () => {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(PROJECTS_KEY);
  initStorage();
};
