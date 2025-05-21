import React from 'react';

const PrivacyPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-text-primary">Privacy</h1>
    <p className="mb-4 text-text-secondary">La tua privacy è importante per noi. Questa pagina descrive come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali quando utilizzi GameBacklog.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Dati raccolti</h2>
    <ul className="list-disc ml-6 mb-4 text-text-secondary">
      <li>Dati forniti dall'utente (nome, email, ecc.)</li>
      <li>Dati di utilizzo dell'applicazione</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Utilizzo dei dati</h2>
    <p className="mb-4 text-text-secondary">I dati raccolti vengono utilizzati esclusivamente per migliorare l'esperienza utente e non vengono condivisi con terze parti.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Sicurezza</h2>
    <p className="mb-4 text-text-secondary">Adottiamo misure di sicurezza per proteggere i tuoi dati personali.</p>
    <p className="text-text-disabled text-xs mt-8">Ultimo aggiornamento: maggio 2025</p>
  </div>
);

export default PrivacyPage;
