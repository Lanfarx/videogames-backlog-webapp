import React from 'react';
import { BookOpen, ShieldAlert, GitBranch, AlertTriangle, ExternalLink } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary font-['Montserrat'] tracking-tight mb-3">
          Termini di Servizio & Note Legali
        </h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl font-['Roboto'] mb-3">
          Condizioni d'uso trasparenti per GameBacklog, relative alla natura open-source del software, 
          alla provenienza dei dati e al rispetto dei diritti di proprietà intellettuale di terzi.
        </p>
        <p className="text-xs text-text-disabled font-['Roboto']">
          Ultimo aggiornamento: Ottobre 2026 • Versione Progetto: 1.2
        </p>
      </div>

      <div className="space-y-6">
        {/* Sezione 1: Natura del servizio */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              1. Finalità del Servizio & Clausola "AS-IS"
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-2">
            <p>
              GameBacklog è un software open-source sviluppato come progetto personale di catalogazione, tracking e diario per appassionati di videogiochi.
            </p>
            <p>
              Il servizio è fornito nello stato in cui si trova ("così com'è", AS-IS), a scopo personale e dimostrativo, senza alcuna garanzia esplicita o implicita di uptime continuativo, assenza di interruzioni o idoneità a scopi commerciali.
            </p>
          </div>
        </section>

        {/* Sezione 2: Proprietà intellettuale */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              2. Proprietà Intellettuale & Crediti di Terzi
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-3">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Metadati di Gioco & Copertine (RAWG)</h3>
              <p>
                Tutti i dati di catalogo, le descrizioni, le categorie e le immagini di copertina mostrate nell'applicazione sono recuperati tramite le API pubbliche fornite da{' '}
                <a
                  href="https://rawg.io/apidocs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary underline inline-flex items-center gap-1 hover:text-accent-secondary"
                >
                  RAWG Video Games Database
                  <ExternalLink className="w-3 h-3" />
                </a>
                . Tutti i diritti relativi ai contenuti appartengono a RAWG e ai rispettivi autori.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Marchi e Proprietà dei Videogiochi</h3>
              <p>
                I titoli, i loghi, le illustrazioni promozionali e i marchi registrati dei singoli videogiochi appartengono esclusivamente ai rispettivi sviluppatori, publisher e titolari di copyright. L'utilizzo all'interno di GameBacklog ha finalità esclusivamente informative, referenziali e di catalogazione personale (fair use).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Steam & Marchi Valve</h3>
              <p>
                Steam e il logo Steam sono marchi registrati di Valve Corporation negli Stati Uniti e/o in altri paesi. GameBacklog non è affiliato, autorizzato, sponsorizzato o in alcun modo ufficialmente collegato a Valve Corporation.
              </p>
            </div>
          </div>
        </section>

        {/* Sezione 3: Codice open-source */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              3. Codice Sorgente & Distribuzione
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-2">
            <p>
              L'architettura software di GameBacklog è interamente open-source ed è consultabile sul repository ufficiale GitHub{' '}
              <a
                href="https://github.com/Lanfarx/videogames-backlog-webapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary underline inline-flex items-center gap-1 hover:text-accent-secondary"
              >
                Lanfarx/videogames-backlog-webapp
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
            <p>
              Gli utenti che decidono di compilare, clonare o ospitare autonomamente una propria istanza sono responsabili della configurazione della propria infrastruttura e dell'ottenimento delle rispettive chiavi API terze (Steam API Key, RAWG API Key).
            </p>
          </div>
        </section>

        {/* Sezione 4: Manutenzione e backup */}
        <section className="bg-primary-bg border border-border-color rounded-xl p-6 hover:border-accent-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat']">
              4. Gestione dei Dati & Responsabilità di Backup
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed pl-12 space-y-2">
            <p>
              Trattandosi di un'istanza personale con database PostgreSQL locale/containerizzato, l'integrità dei record e la persistenza dei volumi dipendono dalla gestione dell'ambiente host.
            </p>
            <p>
              È cura dell'amministratore dell'ambiente predisporre periodici backup del database prima di eseguire migrazioni maggiori o riconfigurazioni dei container. L'autore del software non è responsabile per eventuali corruzioni o perdite di dati derivanti da malfunzionamenti hardware o software dell'ambiente ospitante.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
