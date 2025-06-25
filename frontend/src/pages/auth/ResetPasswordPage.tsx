import React, { useState, useEffect } from 'react';
import { Input, PasswordStrengthBar, Divider } from '../../components/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { resetPassword } from '../../store/services/authService';

const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!email || !token) {
      showToast('error', 'Link non valido', 'Il link di reset password non è valido o è scaduto.');
      navigate('/forgot-password');
    }
  }, [email, token, navigate, showToast]);

  // Validazione forza password
  let passwordStrength = '';
  if (newPassword.length === 0) {
    passwordStrength = '';
  } else if (newPassword.length < 8) {
    passwordStrength = 'debole';
  } else if (/[0-9]/.test(newPassword) && /[A-Z]/.test(newPassword) && newPassword.length > 10) {
    passwordStrength = 'forte';
  } else if (/[A-Z]/.test(newPassword)) {
    passwordStrength = 'media';
  } else {
    passwordStrength = '';
  }

  const passwordMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordMatch) {
      setError('Le password non coincidono');
      return;
    }

    if (newPassword.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, token, newPassword });
      showToast('success', 'Password aggiornata!', 'La tua password è stata reimpostata con successo.');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Token non valido o scaduto. Richiedi un nuovo link di reset.';
      setError(errorMessage);
      showToast('error', 'Errore', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="font-montserrat font-semibold text-2xl text-text-primary mb-1">
        Reimposta password
      </h2>
      <p className="text-base text-text-secondary font-roboto mb-8">
        Inserisci la tua nuova password per <strong>{email}</strong>
      </p>
      
      {error && (
        <div className="mb-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Input
            label="Nuova password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nuova password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            iconRight={
              <span onClick={() => setShowPassword((v) => !v)} title="Mostra/Nascondi password" style={{ cursor: 'pointer' }}>
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/>
                  </svg>
                )}
              </span>
            }
          />
          <PasswordStrengthBar strength={passwordStrength as any} />
          <p className="text-xs text-text-secondary mt-1">Minimo 8 caratteri, una maiuscola, un numero</p>
        </div>

        <div>
          <Input
            label="Conferma nuova password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Ripeti la nuova password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            valid={!!passwordMatch}
            iconRight={
              <span onClick={() => setShowConfirmPassword((v) => !v)} title="Mostra/Nascondi password" style={{ cursor: 'pointer' }}>
                {showConfirmPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/>
                  </svg>
                )}
              </span>
            }
          />
          {confirmPassword.length > 0 && !passwordMatch && (
            <p className="text-xs text-red-600 mt-1">Le password non coincidono</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-10 py-3 rounded-lg min-w-[200px] hover:bg-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newPassword || !confirmPassword || !passwordMatch || isLoading}
          >
            {isLoading ? 'Aggiornamento...' : 'Reimposta password'}
          </button>
        </div>

        <Divider text="O" />
      </form>

      <div className="text-center mt-8 text-sm text-text-secondary">
        <a href="/forgot-password" className="text-accent font-medium hover:underline">
          Richiedi un nuovo link
        </a>
      </div>
    </>
  );
};

export default ResetPasswordPage;
