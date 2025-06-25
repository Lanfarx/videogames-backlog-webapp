import React, { useState } from "react";
import SettingsSection from "../SettingsSection";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setUserProfile } from '../../../store/slice/userSlice';
import { updateProfile } from '../../../store/services/profileService';

const ConnectedAccountsSettings: React.FC = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user.profile);

  const [steamIdInput, setSteamIdInput] = useState("");
  const [steamIdError, setSteamIdError] = useState("");
  const handleSteamIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Solo numeri
    setSteamIdInput(value);
    
    if (value.length === 0) {
      setSteamIdError("");
    } else if (value.length !== 17) {
      setSteamIdError("Lo Steam ID deve essere di 17 cifre");
    } else if (!value.startsWith("765611")) {
      setSteamIdError("Steam ID non valido (deve iniziare con 765611)");
    } else {
      setSteamIdError("");
    }
  };  const handleConnectSteam = async () => {
    if (steamIdInput.length === 17 && steamIdInput.startsWith("765611") && userProfile) {
      const newProfile = {
        ...userProfile,
        steamId: steamIdInput
      };
      const updated = await updateProfile(newProfile);
      dispatch(setUserProfile(updated));
      setSteamIdInput("");
      setSteamIdError("");
    } else {
      if (steamIdInput.length !== 17) {
        setSteamIdError("Lo Steam ID deve essere di 17 cifre");
      } else if (!steamIdInput.startsWith("765611")) {
        setSteamIdError("Steam ID non valido (deve iniziare con 765611)");
      }
    }
  };

  const handleDisconnectSteam = async () => {
    if (userProfile) {
      const newProfile = {
        ...userProfile,
        steamId: undefined
      };
      const updated = await updateProfile(newProfile);
      dispatch(setUserProfile(updated));
    }
  };

  if (!userProfile) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">
          Account collegati
        </h2>
      </div>
      <SettingsSection title="Servizi di gaming">
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Collega i tuoi account di gioco per sincronizzare automaticamente la tua libreria e i tuoi progressi.
          </p>
          {/* Account Steam */}
          <div className="border border-border-color rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-platform-steam p-1.5 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ffffff"
                  >
                    <path d="M12 2C5.923 2 1 6.923 1 13c0 6.078 4.923 11 11 11s11-4.922 11-11c0-6.077-4.923-11-11-11zm0 4.967c2.784 0 5.046 2.262 5.046 5.046 0 2.783-2.262 5.046-5.046 5.046s-5.046-2.263-5.046-5.046c0-2.784 2.262-5.046 5.046-5.046zm-7.073 9.832v-.002c.819.827 1.128 1.714 1.017 2.61-.11.895-.666 1.72-1.672 2.476l-.673-.953c.704-.535 1.1-1.066 1.184-1.597.084-.531-.164-1.101-.747-1.71l.891-.824zM12 8.653c-1.846 0-3.36 1.513-3.36 3.36 0 1.846 1.514 3.359 3.36 3.359s3.36-1.513 3.36-3.359c0-1.847-1.514-3.36-3.36-3.36z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-medium text-text-primary">
                      Account Steam
                    </h3>
                    <div className="relative group">
                      <span className="cursor-help text-text-secondary rounded-full bg-border-color w-4 h-4 inline-flex items-center justify-center text-xs">?</span>
                      <div className="absolute hidden group-hover:block w-64 p-2 bg-slate-700 text-white text-xs rounded-lg -top-2 left-6 shadow-lg z-20">
                        <p className="mb-1">
                          Nota: tutte le impostazioni del profilo Steam riguardanti la privacy devono essere pubbliche per il corretto funzionamento.
                        </p>
                      </div>
                    </div>
                  </div>
                  {userProfile.steamId ? (
                    <p className="text-xs text-accent-success break-all mb-0">
                      Steam ID collegato: <span className="font-mono">{userProfile.steamId}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      Collega il tuo account Steam
                    </p>
                  )}
                </div>
              </div>
              {userProfile.steamId ? (
                <button
                  className="text-sm text-accent-danger hover:underline"
                  onClick={handleDisconnectSteam}
                >
                  Scollega
                </button>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-2">
                    <div className="relative group">
                      <input
                        type="text"
                        name="steam"
                        placeholder="Steam ID 64"
                        value={steamIdInput}
                        onChange={handleSteamIdChange}
                        maxLength={17}
                        className={`px-3 py-1 text-sm border ${
                          steamIdError ? "border-red-500" : "border-border-color"
                        } rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary`}
                      />
                      {steamIdError && (
                        <p className="text-xs text-red-500 mb-1 absolute top-0 transform -translate-y-5">
                          {steamIdError}
                        </p>
                      )}                      <div className="absolute hidden group-hover:block min-w-48 p-3 bg-slate-700 text-white text-xs rounded-lg top-8 right-0 shadow-lg z-10">
                        <p className="font-medium mb-2">Steam ID64 richiesto</p>
                        <p className="mb-1">• Deve essere di esattamente 17 cifre</p>
                        <p className="mb-1">• Inizia sempre con 765611</p>
                        <p className="text-yellow-200">• Il profilo Steam deve essere pubblico</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleConnectSteam}
                      className="px-3 py-1 bg-accent-primary text-white text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
                    >
                      Collega
                    </button>
                  </div>                  <p className="text-xs text-text-secondary mt-1 text-right">
                    <details className="relative">
                      <summary className="cursor-pointer hover:underline text-accent-primary">
                        Come trovare il mio Steam ID?
                      </summary>
                      <div className="absolute right-0 top-6 w-80 p-4 bg-primary-bg border border-border-color rounded-lg shadow-lg z-20">
                        <h4 className="font-medium text-text-primary mb-2">Come trovare il tuo Steam ID:</h4>
                        <ol className="text-xs text-text-secondary space-y-2 list-decimal list-inside">
                          <li>Apri Steam e vai al tuo profilo</li>
                          <li>Copia l'URL del profilo dalla barra degli indirizzi</li>
                          <li>Vai su <a href="https://steamid.xyz" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">steamid.xyz</a></li>
                          <li>Incolla l'URL del profilo nel campo di ricerca</li>
                          <li>Copia il numero "steamID64" (17 cifre)</li>
                        </ol>
                        <div className="mt-3 p-2 bg-secondary-bg rounded border">
                          <p className="text-xs text-text-secondary">
                            <strong>Esempio:</strong> 76561198000000000
                          </p>
                        </div>
                        <p className="text-xs text-yellow-600 mt-2">
                          ⚠️ Assicurati che il tuo profilo Steam sia pubblico per la sincronizzazione
                        </p>
                      </div>
                    </details>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SettingsSection>
      <SettingsSection title="Altri servizi">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Collega altri servizi esterni per integrare funzionalità aggiuntive nella tua esperienza.
          </p>
          <div className="border border-dashed border-border-color p-4 rounded-lg text-center">
            <p className="text-text-secondary">
              Altri servizi saranno disponibili presto.
            </p>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

export default ConnectedAccountsSettings;
