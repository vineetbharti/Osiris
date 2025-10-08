import React from 'react';
import { User, Lock } from 'lucide-react';

const LoginForm = ({ loginForm, setLoginForm, handleLogin, handleKeyPress }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            onKeyPress={(e) => handleKeyPress(e, handleLogin)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            onKeyPress={(e) => handleKeyPress(e, handleLogin)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
      >
        Sign In
      </button>
    </div>
  );
};

export default LoginForm;
