import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Clock, Droplets, Info, Play, Save, Utensils, X, AlertCircle } from 'lucide-react';
import {
  NotificationSettings,
  ReminderItem,
  getNotificationSettings,
  requestNotificationPermission,
  saveNotificationSettings,
  triggerLiveNotification,
} from '../../utils/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestNotificationSent?: (message: string) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onTestNotificationSent,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getNotificationSettings());
      setTestSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMasterToggle = async (enabled: boolean) => {
    if (enabled && settings.permissionStatus !== 'granted') {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        alert('Les notifications sont bloquées par votre navigateur. Veuillez les autoriser dans les paramètres de votre navigateur.');
        return;
      }
    }

    const updated = {
      ...settings,
      enabled,
      promptAnswered: true,
    };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleReminderToggle = (id: string, enabled: boolean) => {
    const updatedReminders = settings.reminders.map((r) =>
      r.id === id ? { ...r, enabled } : r
    );
    const updated = { ...settings, reminders: updatedReminders };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleReminderTimeChange = (id: string, time: string) => {
    const updatedReminders = settings.reminders.map((r) =>
      r.id === id ? { ...r, time } : r
    );
    const updated = { ...settings, reminders: updatedReminders };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestNotification = async () => {
    if (settings.permissionStatus !== 'granted') {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        alert('Permission de notification non accordée. Veuillez autoriser les notifications dans votre navigateur.');
        return;
      }
    }

    const msg = 'Test NutriPulse.AI 🔔 : Vos rappels fonctionnent parfaitement !';
    const sent = await triggerLiveNotification('NutriPulse.AI 🔔', msg);

    if (onTestNotificationSent) {
      onTestNotificationSent(msg);
    }

    setTestSuccess(sent ? 'Notification de test envoyée avec succès ! Checkez vos notifications.' : 'Notification de test affichée sur l\'application.');
    setTimeout(() => setTestSuccess(null), 5000);
  };

  const getIconForType = (type: ReminderItem['type']) => {
    switch (type) {
      case 'breakfast':
      case 'lunch':
      case 'snack':
      case 'dinner':
        return <Utensils className="w-4 h-4 text-lime-400" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'daily_summary':
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-lime-400/30 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/20">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-lime-400 font-extrabold block">
                PARAMÈTRES DES RAPPELS
              </span>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                Notifications NutriPulse
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Master Toggle Banner */}
          <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${settings.enabled ? 'bg-lime-400/10 text-lime-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {settings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rappels automatiques</h4>
                <p className="text-[11px] text-zinc-400">
                  {settings.enabled ? 'Activés - Vous recevrez des alertes aux heures prévues' : 'Désactivés - Aucun rappel ne sera envoyé'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleMasterToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
            </label>
          </div>

          {/* Browser Permission Status */}
          <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Statut du navigateur :</span>
            {settings.permissionStatus === 'granted' ? (
              <span className="px-2.5 py-0.5 rounded-md bg-lime-400/10 text-lime-400 font-bold border border-lime-400/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Autorisé
              </span>
            ) : settings.permissionStatus === 'denied' ? (
              <span className="px-2.5 py-0.5 rounded-md bg-rose-400/10 text-rose-400 font-bold border border-rose-400/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Bloqué
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 font-bold border border-amber-400/30">
                Non configuré
              </span>
            )}
          </div>

          {/* Test Notification Button */}
          <div className="space-y-2">
            <button
              onClick={handleTestNotification}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-lime-400/30 hover:border-lime-400 font-extrabold uppercase text-xs rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-lime-400" />
              <span>Tester une notification en direct 🔔</span>
            </button>

            {testSuccess && (
              <div className="p-3 bg-lime-400/10 border border-lime-400/30 rounded-xl text-lime-400 text-xs font-mono font-bold text-center animate-fade-in">
                {testSuccess}
              </div>
            )}
          </div>

          {/* Individual Reminders Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono">
              Heures des rappels quotidiens
            </h4>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {settings.reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    reminder.enabled && settings.enabled
                      ? 'bg-zinc-900/90 border-zinc-700/80'
                      : 'bg-zinc-900/30 border-zinc-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className="p-2 rounded-xl bg-zinc-800 shrink-0">
                      {getIconForType(reminder.type)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {reminder.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {reminder.message}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <input
                      type="time"
                      value={reminder.time}
                      disabled={!reminder.enabled || !settings.enabled}
                      onChange={(e) => handleReminderTimeChange(reminder.id, e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 text-lime-400 font-mono font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-lime-400 disabled:opacity-40"
                    />

                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      disabled={!settings.enabled}
                      onChange={(e) => handleReminderToggle(reminder.id, e.target.checked)}
                      className="w-4 h-4 accent-lime-400 rounded cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Fermer & Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
