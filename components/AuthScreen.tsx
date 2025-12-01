
import React, { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface AuthScreenProps {
  onLogin: (isAdmin?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin Backdoor / Exclusive Access
    if (email === 'admin' && password === 'admin') {
        onLogin(true); // Pass true for Admin
        return;
    }

    setIsLoading(true);
    
    // Simulação de delay de rede para usuários normais
    setTimeout(() => {
      setIsLoading(false);
      onLogin(false); // Pass false for Normal User
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"></div>

      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden border border-gray-700 relative z-10 min-h-[600px]">
        
        {/* Left Side - Visual (Desktop) */}
        <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-emerald-900 to-gray-900 p-8 text-center relative">
          <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'url("https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              mixBlendMode: 'overlay'
          }}></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 scale-150">
                <Logo className="w-24 h-24" />
            </div>
            <h1 className="text-3xl font-light tracking-wider mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Engenharia de Cortes 5D</span>
            </h1>
            <p className="text-emerald-200/80 max-w-sm mt-4">
              A revolução da inteligência artificial aplicada ao visagismo e design capilar.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          
          {/* Header Mobile com Logo e Nome */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-8">
             <Logo className="w-20 h-20 mb-4" />
             <h1 className="text-2xl font-light tracking-wider text-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Engenharia de Cortes 5D</span>
             </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">
            {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            {isSignUp ? 'Preencha seus dados para começar.' : 'Entre com suas credenciais para acessar.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 ml-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="consultant" className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">E-mail ou Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="send" className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="list" className="w-5 h-5 text-gray-500" /> 
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-10 p-3"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-emerald-300/30 font-medium rounded-lg text-sm px-5 py-3 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-emerald-900/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processando...
                </div>
              ) : (
                isSignUp ? 'Cadastrar' : 'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-400 hover:text-emerald-300 font-medium ml-1 transition-colors"
              >
                {isSignUp ? 'Fazer Login' : 'Cadastre-se grátis'}
              </button>
            </p>
          </div>
          
          {!isSignUp && (
             <div className="mt-4 text-center">
                <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    Esqueceu sua senha?
                </button>
             </div>
          )}

          {/* Footer Support */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Icon name="mail" className="w-4 h-4" />
                  Precisa de ajuda? <span className="text-gray-300 select-all">4usbeautysmart@gmail.com</span>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};
