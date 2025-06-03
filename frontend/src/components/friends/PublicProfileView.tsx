import React, { useEffect, useState } from 'react';
import { User, Calendar, Trophy, Clock, Gamepad2, Lock, Eye, EyeOff, ArrowLeft, MessageCircle, UserPlus, UserMinus, Ban, UserCheck, UserX } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFriendshipActions, usePublicProfile } from '../../store/hooks/friendshipHooks';
import { PublicProfile } from '../../store/services/friendshipService';

interface PublicProfileViewProps {
  className?: string;
  userName?: string; // Aggiungiamo userName come prop opzionale per quando non viene dalla URL
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ className = '', userName: propUserName }) => {
  const { userName: urlUserName } = useParams<{ userName: string }>();
  const userName = propUserName || urlUserName; // Usa la prop se fornita, altrimenti usa quella dalla URL
  const navigate = useNavigate();
  const { 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend, 
    blockUser 
  } = useFriendshipActions();
  
  const { profile, loading, error, loadProfile, loadProfileByUsername } = usePublicProfile();

  useEffect(() => {
    if (userName) {
      // Se userName è numerico, usa loadProfile, altrimenti loadProfileByUsername
      const userId = parseInt(userName);
      if (!isNaN(userId)) {
        loadProfile(userId);
      } else {
        loadProfileByUsername(userName);
      }
    }
  }, [userName, loadProfile, loadProfileByUsername]);

  const handleAction = async (action: string) => {
    if (!profile) return;
    
    try {
      switch (action) {
        case 'sendRequest':
          await sendFriendRequest(profile.userId);
          break;
        case 'accept':
          await acceptFriendRequest(profile.userId);
          break;
        case 'reject':
          await rejectFriendRequest(profile.userId);
          break;
        case 'remove':
          if (window.confirm(`Sei sicuro di voler rimuovere ${profile.userName} dagli amici?`)) {
            await removeFriend(profile.userId);
          }
          break;
        case 'block':
          if (window.confirm(`Sei sicuro di voler bloccare ${profile.userName}?`)) {
            await blockUser(profile.userId);
          }
          break;      }
      
      // Ricarica il profilo per aggiornare lo stato
      if (userName) {
        const userId = parseInt(userName);
        if (!isNaN(userId)) {
          loadProfile(userId);
        } else {
          loadProfileByUsername(userName);
        }
      }
    } catch (error) {
      console.error('Errore durante l\'azione:', error);
    }
  };

  const getActionButtons = () => {
    if (!profile || !profile.acceptsFriendRequests && !profile.isFriend) return null;

    switch (profile.friendshipStatus) {
      case 'Pending':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('accept')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Accetta Richiesta
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Rifiuta
            </button>
          </div>
        );
      
      case 'Accepted':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {/* TODO: Implementare messaggio */}}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Messaggio
            </button>
            <button
              onClick={() => handleAction('remove')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <UserMinus className="h-4 w-4" />
              Rimuovi Amico
            </button>
          </div>
        );
      
      case 'Blocked':
        return (
          <div className="px-4 py-2 bg-gray-500 text-white rounded-lg">
            <Ban className="h-4 w-4 inline mr-2" />
            Utente Bloccato
          </div>
        );
      
      default:
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('sendRequest')}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Aggiungi Amico
            </button>
            <button
              onClick={() => handleAction('block')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Blocca
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-secondary-bg rounded mb-4"></div>
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-24 bg-secondary-bg rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-secondary-bg rounded mb-2"></div>
              <div className="h-4 bg-secondary-bg rounded mb-2"></div>
              <div className="h-4 bg-secondary-bg rounded w-2/3"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-secondary-bg rounded"></div>
            <div className="h-32 bg-secondary-bg rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-text-secondary opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Profilo non trovato
          </h3>
          <p className="text-text-secondary mb-4">
            {error || 'L\'utente richiesto non esiste o non è disponibile.'}
          </p>
          <button
            onClick={() => navigate('/friends')}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna agli Amici
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-primary-bg border border-border-color rounded-xl ${className}`}>
      {/* Header con torna indietro */}
      <div className="p-6 border-b border-border-color">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna indietro
        </button>
        
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.userName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <User className="h-12 w-12 text-accent-primary" />
              </div>
            )}
          </div>

          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary">
                {profile.userName}
              </h1>
              {profile.isProfilePrivate && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-sm rounded">
                  <Lock className="h-3 w-3" />
                  Privato
                </div>
              )}
              {profile.isFriend && (
                <div className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                  Amico
                </div>
              )}
            </div>
            
            {profile.fullName && (
              <p className="text-lg text-text-secondary mb-2">
                {profile.fullName}
              </p>
            )}
            
            {profile.bio && (
              <p className="text-text-secondary mb-4">
                {profile.bio}
              </p>
            )}            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Info base */}
            <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Membro dal {new Date(profile.memberSince).toLocaleDateString()}
              </div>
            </div>

            {/* Azioni */}
            <div className="flex flex-wrap gap-2">
              {getActionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiche Gaming */}
          <div className="bg-secondary-bg rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-5 w-5 text-accent-primary" />
              <h3 className="text-lg font-semibold text-text-primary">
                Statistiche Gaming
              </h3>
              {!profile.canViewStats && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <EyeOff className="h-4 w-4" />
                  <span className="text-sm">Privato</span>
                </div>
              )}
            </div>

            {profile.canViewStats && profile.stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-primary">
                    {profile.stats.total}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Giochi Totali
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.stats.completed}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Completati
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.stats.inProgress}
                  </div>
                  <div className="text-sm text-text-secondary">
                    In Corso
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {profile.stats.platinum}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Platino
                  </div>
                </div>
                <div className="col-span-2 text-center mt-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-text-secondary" />
                    <span className="text-lg font-semibold text-text-primary">
                      {profile.stats.totalHours}h
                    </span>
                    <span className="text-sm text-text-secondary">
                      di gioco
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <Lock className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Le statistiche sono private</p>
              </div>
            )}
          </div>

          {/* Diario Gaming */}
          <div className="bg-secondary-bg rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gamepad2 className="h-5 w-5 text-accent-primary" />
              <h3 className="text-lg font-semibold text-text-primary">
                Attività Recenti
              </h3>
              {!profile.canViewDiary && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <EyeOff className="h-4 w-4" />
                  <span className="text-sm">Privato</span>
                </div>
              )}
            </div>

            {profile.canViewDiary ? (
              <div className="space-y-3">
                {/* TODO: Implementare chiamata per attività recenti */}
                <div className="text-center py-8 text-text-secondary">
                  <Gamepad2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>Attività recenti non ancora implementate</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <Lock className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Il diario è privato</p>
              </div>
            )}
          </div>
        </div>

        {/* Messaggio privacy */}
        {profile.isProfilePrivate && !profile.isFriend && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <Lock className="h-5 w-5" />
              <span className="font-medium">Profilo Privato</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Questo utente ha un profilo privato. Diventa amico per vedere più informazioni.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileView;
