import React, { useState } from 'react';
import { 
  MessageSquareShare, 
  Sprout, 
  Cpu, 
  HeartPulse, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';
import { ACTIVITIES } from '../data/eventData';
import { Activity } from '../types';
import { ConclaveModal } from './forms/ConclaveModal';
import { PlantationModal } from './forms/PlantationModal';
import { ProjectShowModal } from './forms/ProjectShowModal';
import { BloodDonationModal } from './forms/BloodDonationModal';

interface ActivitiesProps {
  onSelectActivityForRegistration?: (activityId: string) => void;
  externalActiveModal?: 'conclave' | 'plantation' | 'project-show' | 'blood-donation' | null;
  onCloseExternalModal?: () => void;
}

export const Activities: React.FC<ActivitiesProps> = ({
  externalActiveModal,
  onCloseExternalModal,
}) => {
  const [selectedActivityModal, setSelectedActivityModal] = useState<Activity | null>(null);
  const [localActiveRegistration, setLocalActiveRegistration] = useState<
    'conclave' | 'plantation' | 'project-show' | 'blood-donation' | null
  >(null);

  const activeRegistration = externalActiveModal !== undefined ? externalActiveModal : localActiveRegistration;

  const handleCloseRegistration = () => {
    if (onCloseExternalModal) {
      onCloseExternalModal();
    }
    setLocalActiveRegistration(null);
  };

  const handleOpenRegistration = (id: string) => {
    setLocalActiveRegistration(id as any);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquareShare':
        return <MessageSquareShare className="w-7 h-7" />;
      case 'Sprout':
        return <Sprout className="w-7 h-7" />;
      case 'Cpu':
        return <Cpu className="w-7 h-7" />;
      case 'HeartPulse':
        return <HeartPulse className="w-7 h-7" />;
      default:
        return <Sparkles className="w-7 h-7" />;
    }
  };

  const getThemeColors = (id: string) => {
    switch (id) {
      case 'conclave':
        return {
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          iconBg: 'bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white',
          btnBg: 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900',
          borderColor: 'group-hover:border-blue-300',
        };
      case 'plantation':
        return {
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconBg: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white',
          btnBg: 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900',
          borderColor: 'group-hover:border-emerald-300',
        };
      case 'project-show':
        return {
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          iconBg: 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white',
          btnBg: 'bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900',
          borderColor: 'group-hover:border-indigo-300',
        };
      case 'blood-donation':
        return {
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          iconBg: 'bg-rose-100 text-rose-700 group-hover:bg-rose-700 group-hover:text-white',
          btnBg: 'bg-rose-700 hover:bg-rose-800 active:bg-rose-900',
          borderColor: 'group-hover:border-rose-300',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          iconBg: 'bg-blue-100 text-blue-700',
          btnBg: 'bg-blue-700 hover:bg-blue-800',
          borderColor: 'group-hover:border-blue-300',
        };
    }
  };

  return (
    <section id="activities" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Official Event Tracks & Registration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineers' Day Activities
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Click <strong>Register Now</strong> on any track below to open its dedicated registration form.
          </p>
        </div>

        {/* 4 Activities Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIVITIES.map((act) => {
            const theme = getThemeColors(act.id);
            return (
              <div
                key={act.id}
                className={`group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${theme.borderColor}`}
                id={`activity-card-${act.id}`}
              >
                <div>
                  {/* Top: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${theme.iconBg}`}
                    >
                      {getIcon(act.icon)}
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${theme.badgeBg}`}
                    >
                      {act.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {act.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {act.shortDescription}
                  </p>

                  {/* Quick Meta: Venue and Timing */}
                  <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{act.timing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={act.venue}>{act.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Dedicated Register Now + Details */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => handleOpenRegistration(act.id)}
                    className={`w-full py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${theme.btnBg}`}
                    id={`register-btn-${act.id}`}
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedActivityModal(act)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer text-center"
                    id={`details-track-${act.id}-btn`}
                  >
                    View Guidelines & Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Activity Details Modal */}
      {selectedActivityModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedActivityModal(null)}
          id="activity-detail-modal-overlay"
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
            id="activity-detail-modal-card"
          >
            <button
              onClick={() => setSelectedActivityModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                {getIcon(selectedActivityModal.icon)}
              </div>
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Track Guidelines
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {selectedActivityModal.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-5">
              {selectedActivityModal.fullDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-semibold">Timing</span>
                <span className="font-bold text-slate-900">{selectedActivityModal.timing}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Venue</span>
                <span className="font-bold text-slate-900">{selectedActivityModal.venue}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block font-semibold">Faculty In-charge</span>
                <span className="font-bold text-blue-800">{selectedActivityModal.coordinator}</span>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Participation Rules & Guidelines
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedActivityModal.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Key Highlights
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedActivityModal.highlights.map((hl, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-100 font-medium"
                  >
                    • {hl}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const targetId = selectedActivityModal.id;
                  setSelectedActivityModal(null);
                  handleOpenRegistration(targetId);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Register for {selectedActivityModal.title} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedActivityModal(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 DEDICATED ACTIVITY REGISTRATION MODALS */}
      <ConclaveModal
        isOpen={activeRegistration === 'conclave'}
        onClose={handleCloseRegistration}
      />
      <PlantationModal
        isOpen={activeRegistration === 'plantation'}
        onClose={handleCloseRegistration}
      />
      <ProjectShowModal
        isOpen={activeRegistration === 'project-show'}
        onClose={handleCloseRegistration}
      />
      <BloodDonationModal
        isOpen={activeRegistration === 'blood-donation'}
        onClose={handleCloseRegistration}
      />
    </section>
  );
};

