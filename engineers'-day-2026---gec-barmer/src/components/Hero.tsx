import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { COLLEGE_DETAILS } from '../data/eventData';
import { CollegeLogo } from './CollegeLogo';

interface HeroProps {
  onRegisterClick: () => void;
  onViewActivitiesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onViewActivitiesClick }) => {
  // Countdown to September 15, 2026 09:00:00
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-09-15T09:00:00+05:30').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200"
    >
      {/* Subtle Engineering Background Matrix & Vector Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          
          {/* Official Institution Identification Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-xs mb-6 text-xs sm:text-sm font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-blue-700 font-bold uppercase tracking-wider">Official Event</span>
            <span className="text-slate-300">•</span>
            <span>Government Engineering College, Barmer</span>
          </div>

          {/* College Crest in Hero */}
          <div className="mb-6 flex justify-center">
            <CollegeLogo size="xl" className="shadow-lg rounded-full bg-white p-2 border-2 border-blue-600/20" />
          </div>

          {/* Main Institution Title */}
          <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-widest uppercase text-blue-900 mb-4">
            GOVERNMENT ENGINEERING COLLEGE, BARMER
          </h2>

          {/* Primary Event Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl leading-[1.1] mb-6">
            ENGINEERS' DAY{' '}
            <span className="text-blue-700 drop-shadow-xs">2026</span>
          </h1>

          {/* Subtitle with Sir M. Visvesvaraya Tribute */}
          <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-3xl leading-relaxed mb-8">
            Celebrating the 165th Birth Anniversary of{' '}
            <strong className="text-slate-900 font-semibold">Bharat Ratna Sir M. Visvesvaraya</strong>.
            Uniting future technocrats across Rajasthan for sustainable innovation, green campus forestry, and humanitarian service.
          </p>

          {/* Event Quick Meta Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 max-w-3xl">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs text-xs sm:text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-900">{COLLEGE_DETAILS.eventDate}</span>
              <span className="text-slate-400">({COLLEGE_DETAILS.eventDay})</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs text-xs sm:text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>GEC Barmer Main Campus</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12">
            <button
              onClick={onRegisterClick}
              id="hero-register-primary-btn"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-blue-800"
            >
              <span>REGISTER FOR ACTIVITIES</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onViewActivitiesClick}
              id="hero-view-activities-btn"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>EXPLORE 4 ACTIVITIES</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Countdown Clock (Light Professional Theme) */}
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">
              Event Countdown to September 15, 2026
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-extrabold text-blue-700">
                  {timeLeft.days}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">
                  Days
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-800">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">
                  Hours
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-800">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">
                  Minutes
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-4 text-center">
                <div className="text-2xl sm:text-4xl font-extrabold text-amber-600">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">
                  Seconds
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
