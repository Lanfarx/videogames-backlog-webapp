import React from 'react';

const TermsPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-text-primary">Termini di servizio</h1>
    <p className="mb-4 text-text-secondary">Utilizzando GameBacklog accetti i seguenti termini di servizio. Ti invitiamo a leggerli attentamente.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Uso dell'applicazione</h2>
    <p className="mb-4 text-text-secondary">GameBacklog è fornito solo per uso personale. È vietato l'utilizzo per scopi commerciali senza autorizzazione.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Responsabilità</h2>
    <p className="mb-4 text-text-secondary">Non siamo responsabili per eventuali perdite di dati o danni derivanti dall'uso dell'applicazione.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Modifiche ai termini</h2>
    <p className="mb-4 text-text-secondary">Ci riserviamo il diritto di modificare i termini in qualsiasi momento. Le modifiche saranno comunicate tramite questa pagina.</p>
    <p className="text-text-disabled text-xs mt-8">Ultimo aggiornamento: maggio 2025</p>
  </div>
);

export default TermsPage;
