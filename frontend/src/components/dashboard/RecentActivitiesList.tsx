import React, { ReactNode } from 'react';
import { Activity } from '../../types/activity';
import { getActivityIcon, getActivitytext } from '../../utils/activityUtils';
import { formatRelativeTime } from '../../utils/dateUtils';

interface RecentActivitiesListProps {
    activities: Activity[];
    icon?: ReactNode;
    title: string;
}

const RecentActivitiesList: React.FC<RecentActivitiesListProps> = ({ activities, icon, title }) => {
    return (
        <>
            {(icon || title) && (
                <h2 className="text-xl font-bold text-text-primary mb-6 font-['Montserrat'] flex items-center">
                    {icon}
                    {title}
                </h2>
            )}
            <div className="pl-2">
                <div className="space-y-5">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start relative">
                            {/* Timeline verticale (da posizionare a sinistra dell'elemento) */}
                            <div className="w-0.5 absolute h-full left-0 top-0 bg-tertiaryBg"></div>
                            
                            {/* Icona accanto alla timeline */}
                            <div className="flex items-center justify-center ml-4 mr-4">
                                {getActivityIcon(activity.Type)}
                            </div>
                            
                            {/* Contenuto testuale */}
                            <div className="flex-1">
                                <div className="text-sm font-medium text-text-primary font-['Roboto']">
                                    {getActivitytext(activity)}
                                </div>
                                <div className="text-xs text-text-secondary font-['Roboto'] mt-0.5">
                                    {formatRelativeTime(activity.Timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default RecentActivitiesList;
