import { BookOpen, Users, Code, Heart, Github } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: BookOpen,
      title: 'Book Management',
      description: 'Add, edit, and manage your library book inventory with ease',
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Keep track of all registered students and their details',
    },
    {
      icon: Code,
      title: 'Issue & Return',
      description: 'Streamlined book issuing and return process with due date tracking',
    },
    {
      icon: Heart,
      title: 'Role-Based Access',
      description: 'Different permissions for Admin, Librarian, and Student users',
    },
  ];

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <BookOpen className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Digital Access Catalog System (DACS)</h1>
              <p className="text-indigo-100 mt-1">Self-Service. Secure. Accessible.</p>
            </div>
          </div>
          <p className="text-indigo-50 leading-relaxed">
            DACS is a web-based library management system designed to address the challenge
            of tracking borrowed, overdue, and lost books through a centralized digital platform.
            It features role-based access control across three user types: Admin, Librarian, and
            Student. Admins oversee the entire system including user account management. Librarians
            manage the book inventory, issue and return books, monitor overdue fines, and review
            student borrow requests. Students can browse the book catalog, submit borrow requests,
            track their currently borrowed books with overdue alerts, and view their full borrowing
            history. All data is stored in a MySQL database and served through a Spring Boot REST
            API, replacing what was previously a purely manual, analog process.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                  <div
                      key={feature.title}
                      className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            User Roles
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Admin
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Full system access including book management, student management, issue/return operations, and viewing all records.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                Librarian
              </h3>
              <p className="text-purple-700 dark:text-purple-400 text-sm">
                Can manage books, students, issue and return books, and view all library records.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                Student
              </h3>
              <p className="text-green-700 dark:text-green-400 text-sm">
                Can view their own borrowed books, check due dates, and manage their account information.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['React', 'Spring Boot', 'Tailwind CSS', 'Maven', 'Dark Mode', 'Responsive Design'].map(
                (tech) => (
                    <div
                        key={tech}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-center text-gray-800 dark:text-gray-200 text-sm font-medium"
                    >
                      {tech}
                    </div>
                )
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Version 2.3 - Digital Access Catalog System (DACS)
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Built with React + TypeScript + Spring Boot
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Developed by Aaron James Monte Siat</p>
            <a
                href="https://github.com/silkspyder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm transition-colors"
            >
              <Github className="w-4 h-4" />
              github.com/silkspyder
            </a>
          </div>
        </div>
      </div>
  );
}