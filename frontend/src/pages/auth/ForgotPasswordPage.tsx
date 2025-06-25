import React, { useState } from 'react';
import { Input, Divider } from '../../components/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { forgotPassword } from '../../store/services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsSubmitted(true);
      showToast('success', 'Richiesta inviata!', 'Se l\'email è registrata, riceverai un link per il reset della password.');
    } catch (err: any) {
      const errorMessage = 'Errore durante la richiesta di reset password.';
      setError(errorMessage);
      showToast('error', 'Errore', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-montserrat font-semibold text-2xl text-text-primary mb-4">
            Richiesta inviata
          </h2>
          <p className="text-base text-text-secondary font-roboto mb-8">
            Se l'email <strong>{email}</strong> è registrata nel nostro sistema, riceverai un link per reimpostare la password.
          </p>
          <p className="text-sm text-text-secondary font-roboto mb-8">
            Controlla anche la cartella spam. Il link è valido per 1 ora.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-10 py-3 rounded-lg hover:bg-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              Torna al login
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-accent-primary font-medium hover:underline"
            >
              Invia nuovamente
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="font-montserrat font-semibold text-2xl text-text-primary mb-1">
        Password dimenticata?
      </h2>
      <p className="text-base text-text-secondary font-roboto mb-8">
        Inserisci la tua email e ti invieremo un link per reimpostare la password
      </p>
      
      {error && (
        <div className="mb-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="inserisci@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-10 py-3 rounded-lg min-w-[200px] hover:bg-accent-primary/60 focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!email || isLoading}
          >
            {isLoading ? 'Invio in corso...' : 'Invia link di reset'}
          </button>
        </div>

        <Divider text="O" />
      </form>

      <div className="text-center mt-8 text-sm text-text-secondary">
        Ricordi la password?{' '}
        <a href="/login" className="text-accent font-medium hover:underline">
          Torna al login
        </a>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
