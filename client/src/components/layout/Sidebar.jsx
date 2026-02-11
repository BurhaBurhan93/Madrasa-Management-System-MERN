import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/courses', label: 'Courses', icon: '📚' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/attendance', label: 'Attendance', icon: '✅' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/exams', label: 'Exams', icon: '✏️' },
    { path: '/results', label: 'Results', icon: '📈' },
    { path: '/fees', label: 'Fees', icon: '💰' },
    { path: '/library', label: 'Library', icon: '📖' },
    { path: '/communications', label: 'Communications', icon: '💬' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <>
              <div className="bg-blue-500 p-2 rounded-lg">
                <span className="text-xl">🎓</span>
              </div>
              <h1 className="text-xl font-bold">Madrasa EMS</h1>
            </>
          ) : (
            <div className="bg-blue-500 p-2 rounded-lg">
              <span className="text-xl">🎓</span>
            </div>
          )}
        </div>
      </div>
      
      <nav className="p-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 mb-1 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {isExpanded && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-4 right-4 bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
      >
        {isExpanded ? '«' : '»'}
      </button>
    </div>
  );
};

export default Sidebar;