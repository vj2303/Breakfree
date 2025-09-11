'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  batchNumber?: string;
  designation?: string;
  managerName?: string;
  location?: string;
  department?: string;
  division?: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Assignment {
  assignmentId: string;
  assessmentCenter: {
    id: string;
    name: string;
    description: string;
    displayName: string;
    displayInstructions: string;
    competencyIds: string[];
    documentUrl?: string;
    reportTemplateName: string;
    reportTemplateType: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  assessor?: {
    id: string;
    name: string;
    email: string;
    designation: string;
    accessLevel: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  activities: Array<{
    activityId: string;
    activityType: string;
    displayOrder: number;
    competency: {
      id: string;
      competencyName: string;
      subCompetencyNames: string[];
      createdAt: string;
      updatedAt: string;
    };
    activityDetail: {
      id: string;
      name: string;
      description: string;
      instructions: string;
      videoUrl?: string;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
      scenarios: Array<{
        id: string;
        title: string;
        readTime: number;
        exerciseTime: number;
        data: string;
        inboxActivityId: string;
        createdAt: string;
        updatedAt: string;
      }>;
      characters: Array<{
        id: string;
        name: string;
        email: string;
        designation: string;
        inboxActivityId: string;
        createdAt: string;
        updatedAt: string;
      }>;
      organizationCharts: Array<{
        id: string;
        name: string;
        email: string;
        designation: string;
        parentId: string | null;
        inboxActivityId: string;
        createdAt: string;
        updatedAt: string;
      }>;
      contents: Array<{
        id: string;
        to: string[];
        from: string;
        cc: string[];
        bcc: string[];
        subject: string;
        date: string;
        emailContent: string;
        inboxActivityId: string;
        createdAt: string;
        updatedAt: string;
      }>;
    };
    submission: Record<string, unknown> | null;
    isSubmitted: boolean;
  }>;
  totalActivities: number;
  submittedActivities: number;
  completionPercentage: number;
}

interface ParticipantAssignments {
  participant: {
    id: string;
    name: string;
    email: string;
    designation: string;
    managerName: string;
    createdAt: string;
    updatedAt: string;
  };
  assignments: Assignment[];
  totalAssignments: number;
  totalActivities: number;
  totalSubmitted: number;
}

interface AssessorGroup {
  assignmentId: string;
  groupId: string;
  groupName: string;
  adminName: string;
  adminEmail: string;
  participantCount: number;
}

interface AssessorGroupsData {
  assessor: {
    id: string;
    name: string;
    email: string;
    designation: string;
    accessLevel: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  groups: AssessorGroup[];
}

interface Competency {
  id: string;
  competencyName: string;
  subCompetencyNames: string[];
  createdAt: string;
  updatedAt: string;
}

interface AssessmentCenter {
  id: string;
  name: string;
  description: string;
  displayName: string;
  displayInstructions: string;
  competencyIds: string[];
  documentUrl?: string;
  reportTemplateName: string;
  reportTemplateType: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  competencies: Competency[];
}

interface AssessmentCentersData {
  assessmentCenters: AssessmentCenter[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  batchNumber?: string;
  designation?: string;
  managerName?: string;
  location?: string;
  department?: string;
  division?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  data?: {
    user?: User;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  participantId: string | null;
  assessorId: string | null;
  assignments: ParticipantAssignments | null;
  assignmentsLoading: boolean;
  assessorGroups: AssessorGroupsData | null;
  assessorGroupsLoading: boolean;
  assessmentCenters: AssessmentCentersData | null;
  assessmentCentersLoading: boolean;
  register: (data: RegisterData) => Promise<AuthResult>;
  login: (data: LoginData) => Promise<AuthResult>;
  logout: () => void;
  fetchAssignments: () => Promise<void>;
  fetchAssessorGroups: () => Promise<void>;
  fetchAssessmentCenters: (page?: number, limit?: number, search?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [assessorId, setAssessorId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<ParticipantAssignments | null>(null);
  const [assessorGroups, setAssessorGroups] = useState<AssessorGroupsData | null>(null);
  const [assessmentCenters, setAssessmentCenters] = useState<AssessmentCentersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assessorGroupsLoading, setAssessorGroupsLoading] = useState(false);
  const [assessmentCentersLoading, setAssessmentCentersLoading] = useState(false);

  // Function to fetch user profile and set appropriate IDs based on user role
  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      
      if (result.success && result.data) {
        const userData = result.data.user;
        setUser(userData);
        
        // Set IDs based on user role or response data
        if (result.data.participantId) {
          setParticipantId(result.data.participantId);
          console.log('Participant ID from /auth/me API:', result.data.participantId);
        }
        
        if (result.data.assessorId) {
          setAssessorId(result.data.assessorId);
          console.log('Assessor ID from /auth/me API:', result.data.assessorId);
        }
        
        // If no specific IDs provided, determine based on user role or default to user ID
        if (!result.data.participantId && !result.data.assessorId) {
          // For now, we'll use user ID as fallback and determine role from user data
          if (userData.role === 'assessor') {
            setAssessorId(userData.id);
          } else {
            setParticipantId(userData.id);
          }
        }
        
        console.log('User role:', userData.role);
        console.log('Full /auth/me response:', result.data);
        
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Function to fetch participant assignments - wrapped in useCallback
  const fetchAssignments = useCallback(async () => {
    if (!participantId || !token) {
      console.log('No participant ID or token available for fetching assignments');
      return;
    }

    setAssignmentsLoading(true);
    try {
      const res = await fetch(`/api/assignments/participant/${participantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      
      if (result.success && result.data) {
        setAssignments(result.data);
        console.log('Participant assignments fetched:', result.data);
      } else {
        console.error('Failed to fetch assignments:', result.message);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [participantId, token]);

  // Function to fetch assessor groups - wrapped in useCallback
  const fetchAssessorGroups = useCallback(async () => {
    if (!assessorId || !token) {
      console.log('No assessor ID or token available for fetching groups');
      return;
    }

    setAssessorGroupsLoading(true);
    try {
      const res = await fetch(`/api/assessors/${assessorId}/groups`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      
      if (result.success && result.data) {
        setAssessorGroups(result.data);
        console.log('Assessor groups fetched:', result.data);
      } else {
        console.error('Failed to fetch assessor groups:', result.message);
      }
    } catch (error) {
      console.error('Error fetching assessor groups:', error);
    } finally {
      setAssessorGroupsLoading(false);
    }
  }, [assessorId, token]);

  // Function to fetch assessment centers
  const fetchAssessmentCenters = async (page: number = 1, limit: number = 10, search: string = '') => {
    if (!token) {
      console.log('No token available for fetching assessment centers');
      return;
    }

    setAssessmentCentersLoading(true);
    try {
      const res = await fetch(`/api/assessment-centers?page=${page}&limit=${limit}&search=${search}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      
      if (result.success && result.data) {
        setAssessmentCenters(result.data);
        console.log('Assessment centers fetched:', result.data);
      } else {
        console.error('Failed to fetch assessment centers:', result.message);
      }
    } catch (error) {
      console.error('Error fetching assessment centers:', error);
    } finally {
      setAssessmentCentersLoading(false);
    }
  };

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile with existing token
      fetchUserProfile(storedToken);
    }
    setLoading(false);
  }, []);

  // Fetch assignments when participantId and token are available
  useEffect(() => {
    if (participantId && token && !assignments) {
      fetchAssignments();
    }
  }, [participantId, token, assignments, fetchAssignments]);

  // Fetch assessor groups when assessorId and token are available
  useEffect(() => {
    if (assessorId && token && !assessorGroups) {
      fetchAssessorGroups();
    }
  }, [assessorId, token, assessorGroups, fetchAssessorGroups]);

  const register = async (data: RegisterData): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        return { 
          success: false, 
          message: result.message || 'Registration failed',
          data: result.data || undefined
        };
      }
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
        }
        return {
          success: true,
          message: result.message || 'Registration successful',
          data: {
            user: result.data.user,
            token: result.data.token,
            refreshToken: result.data.refreshToken,
            expiresIn: result.data.expiresIn
          }
        };
      }
      
      return { 
        success: false, 
        message: result.message || 'Registration failed',
        data: result.data || undefined
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'An error occurred during registration. Please try again.' 
      };
    }
  };

  const login = async (data: LoginData): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (result.success && result.data && result.data.token) {
        const token = result.data.token;
        setToken(token);
        localStorage.setItem('token', token);
        
        // Fetch user profile and participant ID after successful login
        await fetchUserProfile(token);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed due to network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setParticipantId(null);
    setAssessorId(null);
    setAssignments(null);
    setAssessorGroups(null);
    setAssessmentCenters(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      participantId, 
      assessorId,
      assignments, 
      assignmentsLoading,
      assessorGroups,
      assessorGroupsLoading,
      assessmentCenters,
      assessmentCentersLoading,
      register, 
      login, 
      logout, 
      fetchAssignments,
      fetchAssessorGroups,
      fetchAssessmentCenters
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};