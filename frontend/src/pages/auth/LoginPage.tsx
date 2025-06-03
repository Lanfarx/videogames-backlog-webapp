import React, { useState } from 'react';
import { Input, Checkbox, Divider } from '../../components/auth';
import { login } from '../../store/services/authService';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserProfile } from '../../store/slice/userSlice';
import { getProfile } from '../../store/services/profileService';
import { getToken } from '../../utils/getToken';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ identifier, password });
      if (remember) {
        localStorage.setItem('token', res.data.token);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', res.data.token);
        localStorage.removeItem('token');
      }      // Aggiorna subito lo stato globale utente
      const token = getToken();
      if (token) {
        const profile = await getProfile();
        dispatch(setUserProfile(profile));
      }
      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.Status === 401) {
        setError('Credenziali non corrette.');
      } else {
        setError('Errore durante il login.');
      }
    }
  };

  return (
      <>
        <h2 className="font-montserrat font-semibold text-2xl text-gray-900 mb-1">Accedi al tuo account</h2>
        <p className="text-base text-gray-500 font-roboto mb-8">Bentornato nella tua libreria</p>
        {error && (
          <div className="mb-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <form className="space-y-0" onSubmit={handleSubmit}>
          <Input
            label="Email o Username"
            type="text"
            placeholder="Email o Username"
            autoComplete="Username"
            required
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            iconRight={
              <span onClick={() => setShowPassword((v) => !v)} title="Mostra/Nascondi password">
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
                )}
              </span>
            }
          />
          <div className="flex items-center justify-between mb-8">
            <Checkbox
              label="Ricordami"
              checked={remember}
              onChange={() => setRemember((v) => !v)}
              id="remember"
            />
            <a href="#" className="text-accent-primary text-sm font-medium hover:underline">Password dimenticata?</a>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-10 mb-6 mt-8 rounded-lg h-12 min-w-[180px] hover:bg-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              disabled={!identifier || !password}
            >
              Accedi
            </button>
          </div>
          <Divider text="O" />
        </form>
        <div className="text-center mt-8 text-sm text-gray-500">
          Non hai un account?{' '}
          <a href="/register" className="text-accent font-medium hover:underline">Registrati qui</a>
        </div>
      </>
  );
}
export default LoginPage;

