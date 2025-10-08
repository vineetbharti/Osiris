import React from 'react';
import { User, Lock, Building2 } from 'lucide-react';

const RegisterForm = ({ registerForm, setRegisterForm, handleRegister, handleKeyPress }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={registerForm.companyName}
            onChange={(e) => setRegisterForm({...registerForm, companyName: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Shipping Company"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
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
            value={registerForm.password}
            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
            onKeyPress={(e) => handleKeyPress(e, handleRegister)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
      >
        Register Company
      </button>
    </div>
  );
};

export default RegisterForm;
