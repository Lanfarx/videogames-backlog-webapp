import React from 'react';

const ContactPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-text-primary">Contatti</h1>
    <p className="mb-4 text-text-secondary">Hai domande, suggerimenti o bisogno di assistenza? Contattaci!</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Email</h2>
    <p className="mb-4 text-text-secondary">Scrivici a <a href="mailto:gamebacklogcontact@gmail.com" className="text-accent-primary underline">gamebacklogcontact@gmail.com</a></p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Social</h2>
    <p className="mb-4 text-text-secondary">Seguici sui nostri canali social per aggiornamenti e novità.</p>
    <ul className="list-disc ml-6 text-text-secondary">
      <li>Twitter: <a href="https://twitter.com/gamebacklog" className="text-accent-primary underline">@gamebacklog</a></li>
      <li>Instagram: <a href="https://instagram.com/gamebacklog" className="text-accent-primary underline">@gamebacklog</a></li>
    </ul>
    <p className="text-text-disabled text-xs mt-8">Rispondiamo entro 72 ore lavorative.</p>
  </div>
);

export default ContactPage;
