import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { registerAccount, loginAccount } from '../../utils/authStorage';
import { UserAccount } from '../../types';
import logoImg from '../../assets/images/nutripulse_logo_1785324265038.jpg';

interface AuthModalProps {
  isOpen?: boolean;
  onAuthSuccess?: (user: UserAccount) => void;
  onSuccess?: (user: UserAccount) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
  canSkip?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onAuthSuccess,
  onSuccess,
  onClose,
  initialMode = 'register',
  canSkip = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSuccessCallback = (user: UserAccount) => {
    if (onAuthSuccess) onAuthSuccess(user);
    if (onSuccess) onSuccess(user);
    if (onClose) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Veuillez renseigner votre prénom ou nom.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }

        const res = registerAccount(name, email, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Erreur lors de la création du compte.');
          setLoading(false);
          return;
        }

        setSuccessMsg('Compte créé avec succès ! Bienvenue.');
        setTimeout(() => {
          handleSuccessCallback(res.user!);
        }, 600);
      } else {
        const res = loginAccount(email, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Identifiants incorrects.');
          setLoading(false);
          return;
        }

        setSuccessMsg('Connexion réussie !');
        setTimeout(() => {
          handleSuccessCallback(res.user!);
        }, 500);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-6 sm:p-8 text-center relative">
          {canSkip && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-xs font-mono font-bold px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800"
            >
              Fermer ✕
            </button>
          )}

          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-lime-400/50 shadow-lg shadow-lime-400/30 mx-auto mb-3">
            <img src={logoImg} alt="NutriPulse Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold block mb-1">MON COMPTE NUTRITION</span>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
            {mode === 'register' ? 'Créer un Compte' : 'Se Connecter'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'register'
              ? 'Sauvegardez votre journal, vos objectifs et vos données sur votre compte sécurisé.'
              : 'Accédez à votre espace nutrition et retrouvez vos progrès.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                mode === 'register' ? 'bg-lime-400 text-black font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer Compte</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                mode === 'login' ? 'bg-lime-400 text-black font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Connexion</span>
            </button>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-lime-400/10 border border-lime-400/30 text-lime-400 rounded-xl text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name field (Register only) */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400">Prénom / Nom</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alex Moreau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400">Adresse E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="Ex: alex@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field (Register only) */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400">Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-lg shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{mode === 'register' ? 'S’inscrire & Commencer' : 'Se Connecter'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick guest skip option if allowed */}
          {canSkip && onClose && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline font-mono"
              >
                Continuer en tant qu'invité (Mode local)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
