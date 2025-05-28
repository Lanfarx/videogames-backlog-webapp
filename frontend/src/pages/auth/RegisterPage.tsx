// Pagina di Registrazione per GameBacklog
import React, { useState } from 'react';
import { Input, Checkbox, PasswordStrengthBar, Divider } from '../../components/auth';
import AuthLayout from '../../components/auth/AuthLayout';
import { GAME_PLATFORMS } from '../../constants/gameConstants';
import { useNavigate } from 'react-router-dom';
import { register } from '../../store/services/authService';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [platform, setPlatform] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Dummy validazione e forza password
  const usernameValid = username.length >= 3 && /^[a-zA-Z0-9]+$/.test(username);
  let passwordStrength = '';
  if (password.length === 0) {
    passwordStrength = '';
  } else if (password.length < 8) {
    passwordStrength = 'debole';
  } else if (/[0-9]/.test(password) && /[A-Z]/.test(password) && password.length > 10) {
    passwordStrength = 'forte';
  } else if (/[A-Z]/.test(password)) {
    passwordStrength = 'media';
  } else {
    passwordStrength = '';
  }
  const passwordMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Se le password non coincidono, blocca il submit e mostra la validazione nativa
    if (!passwordMatch) {
      // Forza la validazione nativa HTML5 su conferma password
      const confirmInput = document.querySelector<HTMLInputElement>('input[placeholder="Ripeti la password"]');
      if (confirmInput) {
        confirmInput.setCustomValidity('Le password non coincidono');
        confirmInput.reportValidity();
        setTimeout(() => confirmInput.setCustomValidity(''), 2000); // resetta dopo 2s
      }
      return;
    }
    try {
      await register({ email, password });
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError('Questa email è già registrata.');
      } else {
        setError('Errore durante la registrazione.');
      }
    }
  };

  return (
    <AuthLayout>
        <h2 className="font-montserrat font-semibold text-2xl text-gray-900 mb-1">Crea il tuo account</h2>
        <p className="text-base text-gray-500 font-roboto mb-8">Inizia a organizzare la tua libreria di giochi</p>
        {error && (
          <div className="mb-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            label="Nome utente"
            type="text"
            placeholder="Scegli un nome utente"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            valid={usernameValid}
            iconRight={username.length > 0 ? (
              usernameValid ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9FC089"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#FB7E00"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              )
            ) : null}
            helperText="Minimo 3 caratteri, solo lettere e numeri"
          />
          <Input
            label="Email"
            type="email"
            placeholder="inserisci@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <div className="mb-4">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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
            <PasswordStrengthBar strength={passwordStrength as any} />
            <p className="text-xs text-gray-500 mt-1">Minimo 8 caratteri, una maiuscola, un numero</p>
          </div>
          {confirmPassword.length > 0 && !passwordMatch && (
            <p className="text-xs text-red-600">Le password non coincidono</p>
          )}
          <Input
            label="Conferma password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Ripeti la password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            valid={!!passwordMatch}
            autoComplete="new-password"
            required
            iconRight={confirmPassword.length > 0 && passwordMatch ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9FC089"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            ) : null}
          />
          {/* Preferenze Gaming */}
          <div className="mb-6">
            <div className="font-roboto font-medium text-base text-gray-900 mb-1">Dimmi qualcosa di te</div>
            <div className="text-sm text-gray-500 mb-2">Ci aiuta a personalizzare la tua esperienza</div>
            <select
              className="w-full h-12 px-4 rounded-lg border border-gray-300 text-base font-normal focus:border-accent focus:shadow-[0_0_0_2px_rgba(251,126,0,0.2)] mb-2"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
            >
              <option value="">Piattaforma preferita</option>
              {GAME_PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {/* Termini e Privacy */}
          <div className="mb-8">
            <Checkbox
              label={<span>Accetto i <a href="/terms" className="text-accent underline hover:underline">Termini di Servizio</a> e la <a href="/privacy" className="text-accent underline hover:underline">Privacy Policy</a></span> as any}
              checked={acceptTerms}
              onChange={() => setAcceptTerms(v => !v)}
              required
            />
          </div>
           <div className="flex justify-center">
            <button
              type="submit"
              className="bg-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-10 mb-6 mt-8 rounded-lg h-12 min-w-[180px] hover:bg-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              disabled={!acceptTerms || !usernameValid || !email || !password || !confirmPassword || !passwordMatch}
            >
              Crea un account
            </button>
          </div>
          <Divider text="O" />
        </form>
        <div className="text-center mt-8 text-sm text-gray-500">
          Hai già un account?{' '}
          <a href="/login" className="text-accent font-medium hover:underline">Accedi qui</a>
        </div>
    </AuthLayout>
  );
};

export default RegisterPage;
