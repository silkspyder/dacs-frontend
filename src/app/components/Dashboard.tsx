import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import {
  BookOpen, Users, BookPlus, BookMinus, FileText, UserCircle, Info,
  LogOut, Moon, Sun, Menu, X, UserCog, Bell, PhilippinePeso,
  BookMarked, History, Library, ClipboardList,
} from 'lucide-react';

import { BookManagement }   from './BookManagement';
import { StudentManagement } from './StudentManagement';
import { IssueBook }        from './IssueBook';
import { ReturnBook }       from './ReturnBook';
import { Records }          from './Records';
import { AccountManagement } from './AccountManagement';
import { UserManagement }   from './UserManagement';
import { FineManagement }   from './FineManagement';
import { Notifications }    from './Notifications';
import { MyBooks }          from './MyBooks';
import { MyHistory }        from './MyHistory';
import { BookCatalog }      from './BookCatalog';
import { BorrowRequests }   from './BorrowRequests';
import { About }            from './About';
import { DataStore }        from '../data/mockData';

type Tab =
  | 'dashboard' | 'books'     | 'students'       | 'users'
  | 'issue'     | 'return'    | 'fines'           | 'notifications'
  | 'records'   | 'mybooks'   | 'myhistory'       | 'catalog'
  | 'borrowrequests' | 'account' | 'about'; //adjusted kay di mabasa sa WebStorm, taas ra kaayo

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems: { id: Tab; label: string; icon: any; roles: string[] }[] = [
    { id: 'dashboard',     label: 'Dashboard',         icon: BookOpen,        roles: ['Admin', 'Librarian', 'Student'] },
    //admin only
    { id: 'users',         label: 'User Management',   icon: UserCog,         roles: ['Admin'] },
    //admin & librarian
    { id: 'books',         label: 'Book Management',   icon: BookOpen,        roles: ['Admin', 'Librarian'] },
    { id: 'students',      label: 'Student Management',icon: Users,           roles: ['Admin', 'Librarian'] },
    { id: 'issue',         label: 'Issue Book',        icon: BookPlus,        roles: ['Admin', 'Librarian'] },
    { id: 'return',        label: 'Return Book',       icon: BookMinus,       roles: ['Admin', 'Librarian'] },
    { id: 'fines',         label: 'Fine Management',   icon: PhilippinePeso,  roles: ['Admin', 'Librarian'] },
    { id: 'notifications', label: 'Notifications',     icon: Bell,            roles: ['Admin', 'Librarian'] },
    { id: 'borrowrequests',label: 'Borrow Requests',   icon: ClipboardList,   roles: ['Admin', 'Librarian'] },
    { id: 'records',       label: 'Records',           icon: FileText,        roles: ['Admin', 'Librarian'] },
    // Student only
    { id: 'catalog',       label: 'Book Catalog',      icon: Library,         roles: ['Student'] },
    { id: 'mybooks',       label: 'My Books',          icon: BookMarked,      roles: ['Student'] },
    { id: 'myhistory',     label: 'My History',        icon: History,         roles: ['Student'] },
    { id: 'borrowrequests',label: 'Borrow Requests',   icon: ClipboardList,   roles: ['Student'] },
    { id: 'records',       label: 'My Records',        icon: FileText,        roles: ['Student'] },
    //all users
    { id: 'account',       label: 'Account',           icon: UserCircle,      roles: ['Admin', 'Librarian', 'Student'] },
    { id: 'about',         label: 'About',             icon: Info,            roles: ['Admin', 'Librarian', 'Student'] },
  ];

  //deduplicate: if same id appears for different roles, only show it once per role group
  const seen = new Set<string>();
  const allowedMenuItems = menuItems.filter((item) => {
    if (!item.roles.includes(user?.usertype || '')) return false;
    const key = item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'books':          return <BookManagement />;
      case 'students':       return <StudentManagement />;
      case 'users':          return <UserManagement />;
      case 'issue':          return <IssueBook />;
      case 'return':         return <ReturnBook />;
      case 'fines':          return <FineManagement />;
      case 'notifications':  return <Notifications />;
      case 'borrowrequests': return <BorrowRequests />;
      case 'records':        return <Records />;
      case 'catalog':        return <BookCatalog />;
      case 'mybooks':        return <MyBooks />;
      case 'myhistory':      return <MyHistory />;
      case 'account':        return <AccountManagement />;
      case 'about':          return <About />;
      default:               return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><BookOpen className="w-6 h-6 text-white" /></div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white"> Digital Access Catalog System (DACS) </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.usertype}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {allowedMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {sidebarOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {allowedMenuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{user?.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, students: 0, issued: 0, total: 0 });

  useEffect(() => {
    const load = async () => {
      const [books, students, issues] = await Promise.all([
        DataStore.getBooks(),
        DataStore.getStudents(),
        DataStore.getIssues(),
      ]);
      setStats({
        books:    books.reduce((sum, b) => sum + b.quantity, 0),
        students: students.length,
        issued:   issues.filter((i) => i.status === 'pending').length,
        total:    issues.length,
      });
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Books',    value: stats.books,    icon: BookOpen,  color: 'bg-blue-500' },
    { label: 'Total Students', value: stats.students, icon: Users,     color: 'bg-green-500' },
    { label: 'Books Issued',   value: stats.issued,   icon: BookPlus,  color: 'bg-yellow-500' },
    { label: 'Total Records',  value: stats.total,    icon: FileText,  color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Welcome back, {user?.username}!</h2>
        <p className="text-gray-600 dark:text-gray-400">Here's what's happening in your library today</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}><Icon className="w-6 h-6 text-white" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
