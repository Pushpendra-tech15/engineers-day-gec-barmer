import React from 'react';
import { Mail, Phone, UserCheck } from 'lucide-react';
import { COORDINATORS, COLLEGE_DETAILS } from '../data/eventData';

export const Coordinators: React.FC = () => {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Coordinators & Organizing Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Coordinators & Contact
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Reach out to the student coordinators at{' '}
            <strong className="text-slate-900 font-semibold">{COLLEGE_DETAILS.name}</strong> for queries and support.
          </p>
        </div>

        {/* Coordinators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {COORDINATORS.map((coord) => (
            <div
              key={coord.id}
              className={`rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                coord.isChief
                  ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                  : 'bg-slate-50 hover:bg-white border-slate-200 shadow-xs hover:shadow-md'
              }`}
              id={`coordinator-card-${coord.id}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      coord.isChief
                        ? 'bg-blue-700 text-white border-blue-800'
                        : 'bg-white text-blue-800 border-blue-200'
                    }`}
                  >
                    {coord.role}
                  </span>

                  {coord.activityLead && (
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                      Track: {coord.activityLead}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {coord.name}
                </h3>
                <p className="text-xs font-medium text-slate-500 mb-4">
                  {coord.department}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                {coord.email && (
                  <a
                    href={`mailto:${coord.email}`}
                    className="flex items-center gap-2 hover:text-blue-700 transition-colors truncate"
                    title={coord.email}
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{coord.email}</span>
                  </a>
                )}

                {coord.phone && (
                  <a
                    href={`tel:${coord.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold transition-all text-sm group"
                  >
                    <Phone className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>Call: {coord.phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
