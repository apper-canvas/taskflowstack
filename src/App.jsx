import { createContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from './store/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';
import { getIcon } from './utils/iconUtils';

const MoonIcon = getIcon('Moon');
const SunIcon = getIcon('Sun');
const LogOutIcon = getIcon('LogOut');

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
            '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
               ? `/signup?redirect=${currentPath}`
               : currentPath.includes('/login')
               ? `/login?redirect=${currentPath}`
               : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication failed");
      }
    });
  }, [dispatch, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
        toast.success("Logged out successfully");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed");
      }
    }
  };

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-surface-700 dark:text-surface-300">Initializing application...</p>
      </div>
    </div>;
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && (
          <header className="bg-white dark:bg-surface-800 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="text-primary dark:text-primary-light text-2xl font-bold">TaskFlow</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <SunIcon className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-surface-700" />
                  )}
                </button>
                
                <button
                  onClick={authMethods.logout}
                  className="flex items-center space-x-1 p-2 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  aria-label="Logout"
                >
                  <LogOutIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>
        )}

        <main className={`flex-grow container mx-auto px-4 py-6 ${!isAuthenticated ? 'flex items-center justify-center' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {isAuthenticated && (
          <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-4">
            <div className="container mx-auto px-4 text-center text-surface-500 dark:text-surface-400 text-sm">
              © {new Date().getFullYear()} TaskFlow. Efficiently organize and manage tasks.
            </div>
          </footer>
        )}

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          toastStyle={{
            borderRadius: '0.5rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;