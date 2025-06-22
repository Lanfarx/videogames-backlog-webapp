import { useAppSelector } from '../../store/hooks';
import HeroSection from '../../components/home/HeroSection';
import ContinuePlayingSection from '../../components/home/ContinuePlayingSection';
import RecentActivitiesSection from '../../components/home/RecentActivitiesSection';

const HomePage = () => {
    const userProfile = useAppSelector((state) => state.user.profile);

    return (
            <div className="flex-grow">
                <HeroSection UserName={userProfile?.userName || 'Utente'} />
                <ContinuePlayingSection />
                <RecentActivitiesSection />
            </div>
    );
};

export default HomePage;