import React from 'react';
import { Bug, MessageSquare, Code2, User, ExternalLink, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary font-['Montserrat'] tracking-tight mb-3">
          Contatti & Canali di Sviluppo
        </h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl font-['Roboto']">
          GameBacklog è un progetto personale open-source per il tracking e il diario videoludico. 
          Tutti i canali di confronto, segnalazione e supporto tecnico sono centralizzati e gestiti 
          direttamente tramite il repository ufficiale su GitHub.
        </p>
      </div>

      {/* Griglia canali ufficiali */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Segnalazione bug */}
        <div className="bg-primary-bg border border-border-color rounded-xl p-6 flex flex-col justify-between hover:border-accent-primary/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary mb-4">
              <Bug className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat'] mb-2">
              Segnalazione Bug & Malfunzionamenti
            </h2>
            <p className="text-sm text-text-secondary font-['Roboto'] leading-relaxed mb-6">
              Hai riscontrato un errore nella sincronizzazione Steam, un calcolo errato delle statistiche o un problema grafico? Apri una segnalazione dettagliata su GitHub Issues.
            </p>
          </div>
          <div>
            <a
              href="https://github.com/Lanfarx/videogames-backlog-webapp/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded"
            >
              <span>Apri una Issue su GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Idee e discussioni */}
        <div className="bg-primary-bg border border-border-color rounded-xl p-6 flex flex-col justify-between hover:border-accent-primary/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat'] mb-2">
              Idee & Proposte di Funzionalità
            </h2>
            <p className="text-sm text-text-secondary font-['Roboto'] leading-relaxed mb-6">
              Hai in mente nuovi filtri per il catalogo, miglioramenti per il diario di gioco o integrazioni con altre piattaforme? Proponili nello spazio di discussione del progetto.
            </p>
          </div>
          <div>
            <a
              href="https://github.com/Lanfarx/videogames-backlog-webapp/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded"
            >
              <span>Proponi un'idea</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Codice sorgente */}
        <div className="bg-primary-bg border border-border-color rounded-xl p-6 flex flex-col justify-between hover:border-accent-primary/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat'] mb-2">
              Codice Sorgente & Repository
            </h2>
            <p className="text-sm text-text-secondary font-['Roboto'] leading-relaxed mb-6">
              Consulta l'architettura applicativa (.NET 8 con Entity Framework Core e frontend React 19 con TypeScript), visualizza i commit e segui lo sviluppo del software.
            </p>
          </div>
          <div>
            <a
              href="https://github.com/Lanfarx/videogames-backlog-webapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded"
            >
              <span>Esplora Lanfarx/videogames-backlog-webapp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Maintainer */}
        <div className="bg-primary-bg border border-border-color rounded-xl p-6 flex flex-col justify-between hover:border-accent-primary/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-secondary-bg border border-border-color flex items-center justify-center text-accent-primary mb-4">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary font-['Montserrat'] mb-2">
              Sviluppatore & Maintainer
            </h2>
            <p className="text-sm text-text-secondary font-['Roboto'] leading-relaxed mb-6">
              GameBacklog è ideato e mantenuto da Lanfarx per soddisfare l'esigenza di un tracciamento pulito, personale e accurato della propria collezione di videogiochi.
            </p>
          </div>
          <div>
            <a
              href="https://github.com/Lanfarx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded"
            >
              <span>Profilo GitHub @Lanfarx</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Nota tecnica per deploy e configurazione */}
      <div className="p-6 bg-primary-bg border border-border-color rounded-xl flex items-start gap-4">
        <HelpCircle className="w-6 h-6 text-accent-primary shrink-0 mt-0.5" />
        <div className="text-sm text-text-secondary font-['Roboto'] leading-relaxed">
          <h3 className="text-base font-bold text-text-primary font-['Montserrat'] mb-1">
            Informazioni sull'istanza attiva
          </h3>
          <p>
            Questa installazione opera in modalità privata su istanza autonoma. Per configurare un proprio ambiente locale o containerizzato, definire le chiavi API per Steam e RAWG, o avviare gli stack Docker Compose di sviluppo e produzione, fare riferimento alle istruzioni dettagliate nel file README del repository.
          </p>
        </div>
      </div>
    </div>
  );
}
