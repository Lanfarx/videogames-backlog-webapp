import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import AddGameButton from '../../components/ui/AddGameButton';
import AddGameModal from '../../components/game/AddGameModal';
import HeroSection from '../../components/home/HeroSection';
import ContinuePlayingSection from '../../components/home/ContinuePlayingSection';
import RecentActivitiesSection from '../../components/home/RecentActivitiesSection';

const HomePage = () => {
    const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);

    return (
            <><div className="flex-grow">
            <HeroSection username="Utente " />
            <ContinuePlayingSection />
            <RecentActivitiesSection />
        </div><AddGameModal isOpen={isAddGameModalOpen} onClose={() => setIsAddGameModalOpen(false)} /></>
    );
};

export default HomePage;