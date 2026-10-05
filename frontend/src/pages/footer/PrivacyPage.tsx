
import React from 'react';
import { Server, Database, ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary font-['Montserrat'] tracking-tight mb-3">
          Informativa sulla Privacy & Gestione Dati
        </h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl font-['Roboto'] mb-3">
          Trasparenza tecnica completa su come vengono trattate, memorizzate e protette le informazioni 
          all'interno di GameBacklog. Questa istanza opera in ambiente personale e autonomo, con zero telemetria commerciale.
        </p>
        <p className="text-xs text-text-disabled font-['Roboto']">
          Ultimo aggiornamento: Ottobre 2026 • Versione Istanza: 1.2
        </p>
      </div>

      <div className="space-y-6">
        {/* Sezione 1: Architettura */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              1. Architettura dell'Istanza & Trattamento Dati
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-2">
            <p>
              GameBacklog è un'applicazione web open-source per la catalogazione videoludica e il diario di gioco.
              L'istanza corrente è distribuita in modalità privata / self-hosted: tutti i dati risiedono esclusivamente all'interno di un database PostgreSQL dedicato e isolato.
            </p>
            <p>
              Non esiste un server cloud centralizzato condiviso con terze parti o data broker esterni: il proprietario dell'istanza mantiene il controllo esclusivo dell'infrastruttura e dei volumi di persistenza.
            </p>
          </div>
        </section>

        {/* Sezione 2: Dati Memorizzati */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              2. Quali Dati Vengono Memorizzati
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-3">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Dati di Autenticazione</h3>
              <p>
                Username ed eventuale indirizzo email indicati per l'account. Le password non sono mai salvate in chiaro: vengono crittografate mediante hash sicuro con algoritmo PBKDF2 gestito dal framework standard ASP.NET Core Identity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Libreria, Statistiche e Diario</h3>
              <p>
                Titoli inseriti nella libreria personale, stato di avanzamento (Backlog, In Corso, Completato, Abbandonato, Platino), monte ore giocato, date di completamento, valutazioni a stelle e note del diario personale.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Token di Sessione (JWT)</h3>
              <p>
                L'applicazione non utilizza cookie di profilazione o tracciamento. Per mantenere attiva la sessione dell'utente autenticato viene impiegato un JSON Web Token (JWT) temporaneo memorizzato nello storage locale (<code className="text-xs bg-secondary-bg px-1.5 py-0.5 rounded border border-border-color">localStorage</code>) del tuo browser.
              </p>
            </div>
          </div>
        </section>

        {/* Sezione 3: Integrazioni Esterne */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              3. Integrazioni Esterne: Steam & RAWG
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-3">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Sincronizzazione Steam Web API (Opzionale)</h3>
              <p>
                Se decidi di collegare il tuo account Steam tramite il tuo Steam ID pubblico, l'applicazione interroga le API pubbliche di Steam per recuperare l'elenco dei giochi posseduti e le relative ore giocate. GameBacklog non richiede, non gestisce e non memorizza le credenziali di accesso (password o autenticazione a due fattori) né i metodi di pagamento del tuo account Steam.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Metadati di Gioco RAWG Database</h3>
              <p>
                Le copertine dei giochi, i generi, le piattaforme e i dati informativi vengono recuperati tramite le API pubbliche di RAWG.io. Queste chiamate includono solo gli identificativi dei videogiochi richiesti e non trasmettono dati personali o di utilizzo a RAWG.
              </p>
            </div>
          </div>
        </section>

        {/* Sezione 4: Zero Tracciamento Commerciale */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              4. Zero Pubblicità, Zero Tracciamento Commerciale
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              <span>Nessun tracker pubblicitario (Google Ads, Meta Pixel o reti di affiliazione).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              <span>Nessuna cessione, monetizzazione o condivisione dei dati personali con terzi.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
              <span>Nessun cookie di terze parti o script di profilazione comportamentale.</span>
            </div>
          </div>
        </section>

        {/* Sezione 5: Controllo sui dati */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              5. Controllo, Modifica e Cancellazione
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-2">
            <p>
              In qualsiasi momento puoi modificare o eliminare giochi dalla tua libreria, aggiornare valutazioni o cancellare singole voci del diario tramite l'interfaccia utente.
            </p>
            <p>
              L'amministratore dell'istanza ha il pieno controllo sul database e può procedere all'esportazione o alla cancellazione integrale dei record in qualunque momento.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
