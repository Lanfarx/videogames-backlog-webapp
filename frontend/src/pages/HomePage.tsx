import React from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import ContinuePlayingSection from '../components/home/ContinuePlayingSection';
import RecentActivitiesSection from '../components/home/RecentActivitiesSection';

const HomePage = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <HeroSection username="Utente" />
                <ContinuePlayingSection />
                <RecentActivitiesSection />
            </div>
        </Layout>
    );
};

export default HomePage;