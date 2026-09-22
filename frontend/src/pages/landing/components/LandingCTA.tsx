import { Link } from 'react-router-dom';
import { Gamepad2, Sparkles, ShieldCheck } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 bg-gradient-to-b from-secondary-bg via-secondary-bg/95 to-tertiary-bg border border-border-color shadow-2xl text-center">
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent-primary/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Small pill */}
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-primary-bg/70 border border-border-color/80 text-xs font-semibold text-accent-primary mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inizia la tua nuova avventura</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl font-extrabold font-primary text-text-primary tracking-tight mb-5 [text-wrap:balance]">
              Pronto a mettere ordine nella tua passione per i videogiochi?
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-text-secondary font-secondary leading-relaxed mb-10 [text-wrap:pretty]">
              Unisciti a GameBacklog. Configura la tua libreria in pochi istanti e inizia a tracciare ore, progressi e trofei su ogni piattaforma.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-accent-primary text-white font-bold text-base hover:brightness-110 shadow-xl shadow-accent-primary/30 hover:shadow-2xl hover:shadow-accent-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all font-secondary"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Crea Account Gratuito</span>
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-xl bg-secondary-bg text-text-primary font-semibold text-base border-2 border-border-color hover:border-accent-primary hover:text-accent-primary transition-colors duration-200 font-secondary"
              >
                Ho già un account
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary font-secondary">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-success" />
                <span>Completamente gratuito</span>
              </span>
              <span>•</span>
              <span>Nessuna carta di credito richiesta</span>
              <span>•</span>
              <span>Setup in 30 secondi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
