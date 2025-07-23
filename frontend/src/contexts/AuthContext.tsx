import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials, UpdateProfileData } from '@/types/auth';
import { mockApi } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored auth data on app start
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await mockApi.login(credentials.email, credentials.password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = user;
      const authUser: User = userWithoutPassword;

      localStorage.setItem('user', JSON.stringify(authUser));
      dispatch({ type: 'SET_USER', payload: authUser });
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if user already exists
      const existingUser = await mockApi.login(credentials.email, credentials.password);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const user = await mockApi.register(credentials.email, credentials.password, credentials.name);
      
      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = user;
      const authUser: User = userWithoutPassword;

      localStorage.setItem('user', JSON.stringify(authUser));
      dispatch({ type: 'SET_USER', payload: authUser });
      
      toast({
        title: "Account created!",
        description: `Welcome ${user.name}!`,
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!state.user) throw new Error('No user logged in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedUser = await mockApi.updateProfile(state.user.id, data);
      
      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = updatedUser;
      const authUser: User = userWithoutPassword;

      localStorage.setItem('user', JSON.stringify(authUser));
      dispatch({ type: 'SET_USER', payload: authUser });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};