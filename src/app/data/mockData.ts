// =============================================
// DATA LAYER - Connected to Spring Boot API
// =============================================

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  contact: string;
  usertype: 'Admin' | 'Librarian' | 'Student';
}

export interface StudentDetail {
  studentId: number;
  studentName: string;
  course: string;
  branch: string;
  userId?: number;    // linked user account id
  username?: string;  // enriched from backend
  email?: string;     // enriched from backend
}

export interface BookDetail {
  bookId: number;
  bookName: string;
  author: string;
  quantity: number;
}

export interface IssueBookDetail {
  id: number;
  bookId: number;
  bookName: string;
  studentId: number;
  studentName: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'returned';
}

export interface BorrowRequest {
  id: number;
  userId: number;
  studentName: string;
  bookId: number;
  bookName: string;
  requestDate: string;
  preferredDueDate?: string;
  status: 'pending' | 'approved' | 'declined';
  librarianNote?: string;
}

import { api } from '../api/apiClient';

export const DataStore = {
  init() {},

  //USERS
  async getUsers(): Promise<User[]> {
    return api.get<User[]>('/users');
  },
  async updateUser(id: number, updates: Partial<User>) {
    return api.put<User>(`/users/${id}`, updates);
  },
  async deleteUser(id: number) {
    return api.delete(`/users/${id}`);
  },

  //STUDENTS
  async getStudents(): Promise<StudentDetail[]> {
    return api.get<StudentDetail[]>('/students');
  },
  async getStudentByUserId(userId: number): Promise<StudentDetail | null> {
    try {
      return await api.get<StudentDetail>(`/students/by-user/${userId}`);
    } catch {
      return null;
    }
  },
  async addStudent(student: Omit<StudentDetail, 'studentId'>): Promise<StudentDetail> {
    return api.post<StudentDetail>('/students', {
      studentName: student.studentName,
      course: student.course,
      branch: student.branch,
      userId: student.userId ?? null,
    });
  },
  async updateStudent(id: number, updates: Partial<StudentDetail>) {
    return api.put<StudentDetail>(`/students/${id}`, updates);
  },
  async deleteStudent(id: number) {
    return api.delete(`/students/${id}`);
  },

  //BOOOKS
  async getBooks(): Promise<BookDetail[]> {
    return api.get<BookDetail[]>('/books');
  },
  async addBook(book: Omit<BookDetail, 'bookId'>): Promise<BookDetail> {
    return api.post<BookDetail>('/books', {
      bookName: book.bookName,
      author: book.author,
      quantity: book.quantity,
    });
  },
  async updateBook(id: number, updates: Partial<BookDetail>) {
    return api.put<BookDetail>(`/books/${id}`, updates);
  },
  async deleteBook(id: number) {
    return api.delete(`/books/${id}`);
  },

  //BOOK ISSUES
  async getIssues(): Promise<IssueBookDetail[]> {
    return api.get<IssueBookDetail[]>('/issues');
  },
  async getIssuesByUser(userId: number): Promise<IssueBookDetail[]> {
    return api.get<IssueBookDetail[]>(`/issues/user/${userId}`);
  },
  async getIssuesByStudent(studentId: number): Promise<IssueBookDetail[]> {
    return api.get<IssueBookDetail[]>(`/issues/student/${studentId}`);
  },
  async getPendingIssues(): Promise<IssueBookDetail[]> {
    return api.get<IssueBookDetail[]>('/issues/pending');
  },
  async addIssue(issue: Omit<IssueBookDetail, 'id'>): Promise<IssueBookDetail> {
    return api.post<IssueBookDetail>('/issues', {
      bookId: issue.bookId,
      bookName: issue.bookName,
      studentId: issue.studentId,
      studentName: issue.studentName,
      issueDate: issue.issueDate,
      dueDate: issue.dueDate,
      status: 'pending',
    });
  },
  async returnBook(id: number) {
    return api.put(`/issues/${id}/return`, {});
  },

  //BORROW REQUESTS
  async getBorrowRequests(): Promise<BorrowRequest[]> {
    return api.get<BorrowRequest[]>('/borrow-requests');
  },
  async getMyBorrowRequests(userId: number): Promise<BorrowRequest[]> {
    return api.get<BorrowRequest[]>(`/borrow-requests/my/${userId}`);
  },
  async submitBorrowRequest(req: {
    userId: number;
    studentName: string;
    bookId: number;
    bookName: string;
    preferredDueDate?: string;
  }): Promise<BorrowRequest> {
    return api.post<BorrowRequest>('/borrow-requests', req);
  },
  async approveBorrowRequest(id: number, issueDate: string, dueDate: string, librarianNote?: string) {
    return api.put(`/borrow-requests/${id}/approve`, { issueDate, dueDate, librarianNote });
  },
  async declineBorrowRequest(id: number, librarianNote?: string) {
    return api.put(`/borrow-requests/${id}/decline`, { librarianNote });
  },
  async deleteBorrowRequest(id: number) {
    return api.delete(`/borrow-requests/${id}`);
  },
};