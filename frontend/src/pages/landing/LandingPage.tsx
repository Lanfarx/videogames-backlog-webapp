import LandingLayout from '../../components/layout/LandingLayout';
import LandingHero from './components/LandingHero';
import LandingBentoFeatures from './components/LandingBentoFeatures';
import LandingWorkflow from './components/LandingWorkflow';
import LandingCTA from './components/LandingCTA';

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* 1. Hero Section con Asimmetria e Mockup Interattivo */}
      <LandingHero />

      {/* 2. Bento Grid delle Funzionalità Chiave */}
      <LandingBentoFeatures />

      {/* 3. Come Funziona (Workflow a 3 Fasi) */}
      <LandingWorkflow />

      {/* 4. Call to Action Finale ad Alta Conversione */}
      <LandingCTA />
    </LandingLayout>
  );
}

