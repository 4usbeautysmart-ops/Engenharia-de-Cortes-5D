

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Logo } from './Logo';
import { auth } from '../firebase';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToCreateAccount: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToCreateAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin();
    } catch (err: unknown) {
      const message =
        (err as { code?: string }).code === 'auth/invalid-credential'
          ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
          : 'Não foi possível entrar. Tente novamente.';
      setError(message);
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-light tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Engenharia de Cortes 5D</span>
          </h1>
          <p className="text-gray-400 mt-2">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-emerald-900/20 border border-gray-700 space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white rounded-lg font-bold text-lg py-3 hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <p className="text-center text-sm text-gray-400 mt-6">
            Não tem uma conta?{' '}
            <button type="button" onClick={onNavigateToCreateAccount} className="font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none">
              Crie uma
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};