export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  memberships?: Membership[];
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface Organization {
  id: string;
  name: string;
  memberships: Membership[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  user: User;
  userId: string;
  organization: Organization;
  organizationId: string;
  role: Role;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization: Organization;
  organizationId: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: Project;
  projectId: string;
  assignee?: User;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorLog {
  id: string;
  level: string;
  name: string;
  message: string;
  stack?: string;
  context?: string;
  timestamp: Date;
}
