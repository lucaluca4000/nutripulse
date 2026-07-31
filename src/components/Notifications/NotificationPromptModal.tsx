import React, { useState } from 'react';
import { Bell, BellRing, Check, Clock, Droplets, Sparkles, Utensils, X } from 'lucide-react';
import {
  getNotificationSettings,
  requestNotificationPermission,
  saveNotificationSettings,
  triggerLiveNotification,
} from '../../utils/notifications';

interface NotificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionResult?: (granted: boolean) => void;
}

export const NotificationPromptModal: React.FC<NotificationPromptModalProps> = ({
  isOpen,
  onClose,
  onPermissionResult,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      const perm = await requestNotificationPermission();
      const granted = perm === 'granted';
      if (granted) {
        // Send a friendly instant welcome notification
        await triggerLiveNotification(
          'NutriPulse.AI 🔔',
          'Rappels activés avec succès ! NutriPulse vous accompagnera pour vos repas et votre hydratation.'
        );
      }
      if (onPermissionResult) onPermissionResult(granted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleDecline = () => {
    const settings = getNotificationSettings();
    settings.promptAnswered = true;
    settings.enabled = false;
    saveNotificationSettings(settings);
    if (onPermissionResult) onPermissionResult(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-lime-400/40 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col my-auto">
        {/* Glow Header */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 border-b border-zinc-800 relative">
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-400/20 font-black animate-bounce-short">
              <BellRing className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-lime-400 font-extrabold block">
                RAPPELS ET SUIVI EN TEMPS RÉEL
              </span>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                Activer les Notifications ?
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            NutriPulse peut vous envoyer de discrets rappels aux heures clés de la journée pour garder le cap sur vos objectifs caloriques.
          </p>
        </div>

        {/* Highlights List */}
        <div className="p-6 space-y-3.5">
          <div className="flex items-start space-x-3 p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800/80">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 shrink-0 mt-0.5">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rappels de Repas</h4>
              <p className="text-[11px] text-zinc-400">
                Recevez un rappel au petit-déjeuner, déjeuner, collation et dîner pour ne rien oublier.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800/80">
            <div className="p-2 rounded-xl bg-sky-400/10 text-sky-400 shrink-0 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Objectif Hydratation</h4>
              <p className="text-[11px] text-zinc-400">
                Des rappels réguliers pour maintenir une hydratation optimale durant la journée.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800/80">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bilan de fin de journée</h4>
              <p className="text-[11px] text-zinc-400">
                Chaque soir à 21h, un aperçu de vos protéines, glucides et lipides consommés.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800/80 space-y-2">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wider text-xs rounded-2xl shadow-lg shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Bell className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'Activation en cours...' : 'Activer les notifications 🔔'}</span>
          </button>

          <button
            onClick={handleDecline}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-extrabold uppercase text-[11px] rounded-2xl transition-all border border-zinc-800"
          >
            Plus tard / Non merci
          </button>
        </div>
      </div>
    </div>
  );
};
