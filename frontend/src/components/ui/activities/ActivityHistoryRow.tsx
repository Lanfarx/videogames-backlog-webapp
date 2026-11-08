import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { updateActivity, deleteActivity } from '../../../store/thunks/activityThunks';
import { Activity } from '../../../types/activity';
import { getActivityColor } from '../../../constants/gameConstants';
import { getActivitytext } from '../../../utils/activityUtils';
import { useToast } from '../../../contexts/ToastContext';
import ConfirmationModal from '../ConfirmationModal';

interface ActivityHistoryRowProps {
  activity: Activity;
  onChanged: () => void;
}

// value di <input type="datetime-local"> in ora locale
const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// Una riga della cronologia: orario, testo, origine Steam e azioni di modifica/eliminazione
export default function ActivityHistoryRow({ activity, onChanged }: ActivityHistoryRowProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [when, setWhen] = useState('');
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');

  const isPlayed = activity.type === 'Played';

  const startEditing = () => {
    setWhen(toLocalInput(activity.timestamp));
    setHours(String(activity.hoursDelta));
    setNote(activity.additionalInfo ?? '');
    setEditing(true);
  };

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
      onChanged();
    } catch (error: any) {
      showToast('error', failure, error.message);
    }
  };

  const save = () => run(async () => {
    await dispatch(updateActivity({
      id: activity.id,
      data: {
        Timestamp: new Date(when).toISOString(),
        ...(isPlayed ? { HoursDelta: Number(hours) } : { AdditionalInfo: note })
      }
    })).unwrap();
    setEditing(false);
  }, 'Attività non modificata');

  const remove = () => run(async () => {
    await dispatch(deleteActivity(activity.id)).unwrap();
    setConfirmingDelete(false);
  }, 'Attività non eliminata');

  return (
    <div className="group flex items-start gap-3 py-2">
      <span className="text-xs text-text-secondary w-10 shrink-0 pt-0.5">
        {new Date(activity.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: getActivityColor(activity.type) }} />
      <div className="flex-1 min-w-0">
        {editing ? (
          <form className="flex flex-wrap items-center gap-2" onSubmit={event => { event.preventDefault(); save(); }}>
            <input type="datetime-local" value={when} onChange={event => setWhen(event.target.value)} required
              aria-label="Data e ora" className="px-2 py-1 text-sm rounded border border-border-color bg-secondary-bg text-text-primary" />
            {isPlayed ? (
              <input type="number" value={hours} onChange={event => setHours(event.target.value)} required
                aria-label="Ore giocate" className="w-20 px-2 py-1 text-sm rounded border border-border-color bg-secondary-bg text-text-primary" />
            ) : (
              <input type="text" value={note} onChange={event => setNote(event.target.value)}
                aria-label="Nota" className="flex-1 min-w-40 px-2 py-1 text-sm rounded border border-border-color bg-secondary-bg text-text-primary" />
            )}
            <button type="submit" className="px-3 py-1 text-sm rounded bg-accent-primary text-white hover:opacity-90">Salva</button>
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1 text-sm text-text-secondary hover:text-accent-primary">Annulla</button>
          </form>
        ) : (
          <>
            <span className="text-sm text-text-primary">{getActivitytext(activity)}</span>
            {activity.source === 'Steam' && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-secondary-bg border border-border-color text-text-secondary">Steam</span>
            )}
            {activity.gameId == null && (
              <span className="ml-2 text-xs text-text-secondary">gioco eliminato</span>
            )}
          </>
        )}
      </div>
      {!editing && (
        <div className="flex gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button onClick={startEditing} aria-label="Modifica attività" className="p-1 text-text-secondary hover:text-accent-primary">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setConfirmingDelete(true)} aria-label="Elimina attività" className="p-1 text-text-secondary hover:text-accent-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={remove}
        title="Elimina attività"
        message="Eliminare questa attività dalla cronologia? Le ore e lo stato del gioco non cambiano."
        confirmButtontext="Elimina"
        type="danger"
      />
    </div>
  );
}
