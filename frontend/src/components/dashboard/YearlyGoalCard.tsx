import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Target, Pencil } from 'lucide-react';
import { RootState } from '../../store';
import { setUserProfile } from '../../store/slice/userSlice';
import { updateProfile } from '../../store/services/profileService';
import { useToast } from '../../contexts/ToastContext';

interface YearlyGoalCardProps {
    completed: number;
    year: number;
}

// Obiettivo annuale di giochi completati, modificabile al volo
export default function YearlyGoalCard({ completed, year }: YearlyGoalCardProps) {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const profile = useSelector((state: RootState) => state.user.profile);
    const goal = profile?.appPreferences?.yearlyGoal ?? null;
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const startEditing = () => {
        setDraft(goal ? String(goal) : '');
        setEditing(true);
    };

    const save = async () => {
        if (!profile) return;
        const value = Number(draft);
        if (!Number.isInteger(value) || value < 0) return;
        try {
            const updated = await updateProfile({
                ...profile,
                appPreferences: { ...profile.appPreferences, yearlyGoal: value || null }
            });
            dispatch(setUserProfile(updated));
            setEditing(false);
        } catch (error: any) {
            showToast('error', 'Obiettivo non salvato', error.response?.data?.detail || error.message);
        }
    };

    const percent = goal ? Math.min(100, Math.round((completed / goal) * 100)) : 0;

    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-lg hover:border-accent-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary font-['Montserrat'] flex items-center">
                    <Target className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />
                    Obiettivo {year}
                </h2>
                {!editing && (
                    <button onClick={startEditing} aria-label="Modifica obiettivo annuale" className="text-text-secondary hover:text-accent-primary">
                        <Pencil className="h-4 w-4" />
                    </button>
                )}
            </div>
            {editing ? (
                <form className="flex items-center gap-2" onSubmit={event => { event.preventDefault(); save(); }}>
                    <input
                        type="number"
                        min={0}
                        autoFocus
                        value={draft}
                        onChange={event => setDraft(event.target.value)}
                        aria-label="Giochi da completare nell'anno"
                        className="w-24 px-3 py-2 rounded-lg border border-border-color bg-secondary-bg text-text-primary"
                    />
                    <span className="text-sm text-text-secondary">giochi da completare</span>
                    <button type="submit" className="ml-auto px-3 py-2 rounded-lg bg-accent-primary text-white text-sm hover:opacity-90">Salva</button>
                </form>
            ) : goal ? (
                <>
                    <div className="flex items-baseline justify-between mb-2">
                        <span className="text-3xl font-bold font-['Montserrat'] text-accent-primary">{completed}<span className="text-lg text-text-secondary"> / {goal}</span></span>
                        <span className="text-sm text-text-secondary">{percent}%</span>
                    </div>
                    <div className="w-full bg-tertiary-bg h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={completed} aria-valuemax={goal}>
                        <div className="h-full rounded-full bg-accent-primary transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                </>
            ) : (
                <button onClick={startEditing} className="text-sm text-accent-primary hover:underline">
                    Imposta quanti giochi vuoi completare quest'anno
                </button>
            )}
        </div>
    );
}
