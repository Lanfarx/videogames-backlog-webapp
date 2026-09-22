import { Search, SlidersHorizontal, Trophy, ArrowRight } from 'lucide-react';
import { WORKFLOW_STEPS } from '../landingData';

export default function LandingWorkflow() {
  const stepIcons = [
    <Search className="w-5 h-5 text-accent-primary" />,
    <SlidersHorizontal className="w-5 h-5 text-accent-secondary" />,
    <Trophy className="w-5 h-5 text-accent-success" />,
  ];

  return (
    <section id="come-funziona" className="py-20 border-t border-border-color/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider font-secondary">
            Passo dopo passo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-primary text-text-primary tracking-tight mt-2 mb-4 [text-wrap:balance]">
            Inizia a organizzare in 3 semplici mosse
          </h2>
          <p className="text-base text-text-secondary font-secondary [text-wrap:pretty]">
            Nessuna configurazione complessa o passaggi superflui. Il tuo backlog è pronto in pochi secondi.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {WORKFLOW_STEPS.map((step, index) => (
            <div
              key={step.stepNumber}
              className="relative p-7 rounded-2xl bg-secondary-bg/80 border border-border-color/80 hover:border-accent-primary/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Header of step: Number and Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold font-primary text-text-disabled/40">
                    {step.stepNumber}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-tertiary-bg border border-border-color/60 flex items-center justify-center">
                    {stepIcons[index]}
                  </div>
                </div>

                {/* Badge / Tag */}
                <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary mb-3">
                  {step.tag}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-text-primary font-primary mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary font-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Decorative step indicator */}
              <div className="pt-6 mt-6 border-t border-border-color/50 flex items-center text-xs text-text-secondary font-secondary">
                <span>Fase {index + 1} di 3</span>
                {index < 2 && <ArrowRight className="w-3.5 h-3.5 ml-auto text-text-disabled" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
