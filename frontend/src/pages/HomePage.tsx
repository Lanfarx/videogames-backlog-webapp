import React from 'react';
import Layout from '../components/layout/Layout';
import AddGameButton from '../components/ui/AddGameButton';
import HeroSection from '../components/home/HeroSection';
import ContinuePlayingSection from '../components/home/ContinuePlayingSection';
import RecentActivitiesSection from '../components/home/RecentActivitiesSection';
import SearchBar from '../components/ui/atoms/SearchBar';

const HomePage = () => {
    return (
        <Layout>
                <div className=" py-6 px-6 flex items-center">
                    <div className="relative w-full flex items-center">
                    <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>
                        <div className="ml-4">
                            <AddGameButton />
                        </div>
                    </div>
                </div>
            <div className="flex-grow">
                <HeroSection username="Utente " />
                <ContinuePlayingSection />
                <RecentActivitiesSection />
            </div>
        </Layout>
    );  
};

export default HomePage;