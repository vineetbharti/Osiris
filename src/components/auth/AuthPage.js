import React from 'react';
import { Anchor } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = ({ 
  currentPage, 
  setCurrentPage, 
  loginForm, 
  setLoginForm, 
  registerForm, 
  setRegisterForm,
  error,
  success,
  handleLogin,
  handleRegister,
  handleKeyPress
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-500 p-4 rounded-full">
              <Anchor className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Marine Analytics</h1>
          <p className="text-cyan-200">Intelligent Shipping Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setCurrentPage('login')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                currentPage === 'login' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                currentPage === 'register' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {currentPage === 'login' ? (
              <LoginForm 
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                handleLogin={handleLogin}
                handleKeyPress={handleKeyPress}
              />
            ) : (
              <RegisterForm 
                registerForm={registerForm}
                setRegisterForm={setRegisterForm}
                handleRegister={handleRegister}
                handleKeyPress={handleKeyPress}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
