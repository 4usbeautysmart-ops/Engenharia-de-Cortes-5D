
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { auth, db } from '../firebase';

interface CreateAccountScreenProps {
  onAccountCreated: () => void;
  onNavigateToLogin: () => void;
}

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ onAccountCreated, onNavigateToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !repeatPassword.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (password !== repeatPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (fullName.trim()) {
        await updateProfile(credential.user, { displayName: fullName.trim() });
      }

      // Inicializa doc do usuário com período de teste de 48h
      const trialEndsAt = Date.now() + 48 * 60 * 60 * 1000;
      await setDoc(doc(db, 'users', credential.user.uid), {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        subscriptionStatus: 'trial',
        trialEndsAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      onAccountCreated();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const message =
        code === 'auth/email-already-in-use'
          ? 'E-mail já cadastrado.'
          : code === 'auth/weak-password'
            ? 'A senha deve ter pelo menos 6 caracteres.'
            : 'Não foi possível criar a conta. Tente novamente.';
      setError(message);
      console.error('Erro ao criar conta:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-light tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Criar Conta</span>
          </h1>
          <p className="text-gray-400 mt-2">Comece sua jornada 5D</p>
        </div>

        <form onSubmit={handleCreateAccount} className="bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-emerald-900/20 border border-gray-700 space-y-6">
          <input
            type="text"
            placeholder="Nome Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              <Icon name={showPassword ? 'eye-slash' : 'eye'} className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Repetir a Senha"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
             <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              <Icon name={showPassword ? 'eye-slash' : 'eye'} className="w-6 h-6" />
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white rounded-lg font-bold text-lg py-3 hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar Conta'}
          </button>

          <p className="text-center text-sm text-gray-400 pt-2">
            Já tem uma conta?{' '}
            <button type="button" onClick={onNavigateToLogin} className="font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none">
              Faça login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
