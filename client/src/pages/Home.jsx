import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure authentication token exists
    if (!localStorage.getItem('studentToken')) {
      localStorage.setItem('studentToken', 'mock-jwt-token');
    }
    
    // Redirect to student dashboard
    const timer = setTimeout(() => {
      navigate('/student/dashboard');
      setLoading(false);
    }, 500); // Small delay to show loading state
    
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return null; // Only return null after navigation
};

export default Home;