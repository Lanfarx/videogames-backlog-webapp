import {
  Layers,
  Search,
  BarChart3,
  Users2,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Status_COLORS, Status_LABELS } from '../../../constants/gameConstants';

export default function LandingBentoFeatures() {
  const statuses = [
    { key: 'NotStarted', label: Status_LABELS['NotStarted'], color: Status_COLORS['NotStarted'] },
    { key: 'InProgress', label: Status_LABELS['InProgress'], color: Status_COLORS['InProgress'] },
    { key: 'Completed', label: Status_LABELS['Completed'], color: Status_COLORS['Completed'] },
    { key: 'Abandoned', label: Status_LABELS['Abandoned'], color: Status_COLORS['Abandoned'] },
    { key: 'Platinum', label: Status_LABELS['Platinum'], color: Status_COLORS['Platinum'] },
  ];

  return (
    <section id="funzionalita" className="py-20 border-t border-border-color/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-secondary-bg border border-border-color text-xs font-semibold text-accent-primary uppercase tracking-wider mb-4 font-secondary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Esperienza Completa</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-primary text-text-primary tracking-tight mb-4 [text-wrap:balance]">
            Tutto ciò che serve per padroneggiare la tua libreria
          </h2>

          <p className="text-base sm:text-lg text-text-secondary font-secondary [text-wrap:pretty]">
            Dalla catalogazione immediata alle statistiche dettagliate delle tue sessioni: un’esperienza pensata per chi vive i videogiochi sul serio.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Large Span 2 - Status Pipeline */}
          <div className="lg:col-span-2 rounded-2xl p-7 sm:p-8 bg-secondary-bg/90 border border-border-color/80 hover:border-accent-primary/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-primary mb-3">
                Pipeline degli Stati di Gioco
              </h3>

              <p className="text-sm sm:text-base text-text-secondary font-secondary leading-relaxed max-w-xl mb-6">
                Organizza in modo chiaro ogni singolo titolo. Trascina i tuoi giochi attraverso ogni fase: dalla wishlist al download, dall’avventura in corso, all’abbandono o fino al trofeo di platino definitivo.
              </p>
            </div>

            {/* Visual interactive workflow preview inside the card */}
            <div className="p-5 rounded-xl bg-primary-bg/70 border border-border-color/60 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {statuses.map((st, idx) => (
                  <div
                    key={st.key}
                    className="p-3 rounded-lg bg-secondary-bg border border-border-color/50 text-center flex flex-col items-center space-y-2 hover:border-accent-primary/40 transition-colors"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="text-xs font-semibold text-text-primary font-primary">
                      {st.label}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono">
                      Fase 0{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border-color/40 flex items-center justify-between text-xs text-text-secondary">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-success" />
                  <span>Traccia data di inizio e completamento</span>
                </span>
                <span className="font-medium text-accent-primary hidden sm:inline">
                  Sempre sincronizzato
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: RAWG Database Integration */}
          <div className="rounded-2xl p-7 sm:p-8 bg-secondary-bg/90 border border-border-color/80 hover:border-accent-primary/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-secondary/15 text-accent-secondary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-text-primary font-primary mb-3">
                Catalogo RAWG da 800k+ Giochi
              </h3>

              <p className="text-sm text-text-secondary font-secondary leading-relaxed mb-6">
                Trova qualsiasi titolo con la ricerca in tempo reale. Metadati, generi, sviluppatori e punteggi ufficiali Metacritic importati all’istante.
              </p>
            </div>

            {/* Simulated search snippet */}
            <div className="p-4 rounded-xl bg-primary-bg/70 border border-border-color/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-text-secondary border-b border-border-color/40 pb-2">
                <span>Metacritic Score</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  96 / 100
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                Copertine in alta definizione e date di rilascio ufficiali per ogni piattaforma.
              </div>
            </div>
          </div>

          {/* Bento Card 3: Game Diary & Time Tracking */}
          <div className="rounded-2xl p-7 sm:p-8 bg-secondary-bg/90 border border-border-color/80 hover:border-accent-primary/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-text-primary font-primary mb-3">
                Diario di Gioco & Statistiche
              </h3>

              <p className="text-sm text-text-secondary font-secondary leading-relaxed mb-6">
                Visualizza le ore spese su ciascuna piattaforma e per genere. Conserva recensioni, note personali e valuta i tuoi capolavori.
              </p>
            </div>

            {/* Playtime widget simulation */}
            <div className="p-4 rounded-xl bg-primary-bg/70 border border-border-color/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-secondary">
                <span className="text-text-secondary">Distribuzione Piattaforme</span>
                <span className="font-mono text-text-primary font-semibold">142h totali</span>
              </div>
              <div className="h-2 w-full bg-tertiary-bg rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full w-[45%]" title="PlayStation" />
                <div className="bg-slate-700 h-full w-[35%]" title="Steam" />
                <div className="bg-red-500 h-full w-[20%]" title="Switch" />
              </div>
              <div className="flex justify-between text-[10px] text-text-secondary font-mono pt-1">
                <span>PS5: 64h</span>
                <span>Steam: 50h</span>
                <span>Switch 2: 28h</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Community & Friends Feed (Span 2 on lg) */}
          <div className="lg:col-span-2 rounded-2xl p-7 sm:p-8 bg-secondary-bg/90 border border-border-color/80 hover:border-accent-primary/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Users2 className="w-6 h-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-primary mb-3">
                Feed Social & Rete Amici
              </h3>

              <p className="text-sm sm:text-base text-text-secondary font-secondary leading-relaxed max-w-xl mb-6">
                Scopri a cosa stanno giocando i tuoi amici in questo momento. Condividi recensioni, confronta i voti e celebra i platini appena conquistati.
              </p>
            </div>

            {/* Live activity feed preview */}
            <div className="p-4 rounded-xl bg-primary-bg/70 border border-border-color/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-sm">
                  M
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    Marco ha platinato <span className="text-accent-primary">Elden Ring</span>!
                  </div>
                  <div className="text-[11px] text-text-secondary flex items-center space-x-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>2 ore fa • PlayStation 5</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold self-end sm:self-auto">
                <Trophy className="w-3.5 h-3.5" />
                <span>Trofeo Platino</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
