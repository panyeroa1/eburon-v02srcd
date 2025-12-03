
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../../../types-admin-final';

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const emptySlots = Array.from({ length: firstDayOfMonth });
    const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const isToday = (d: number) => { const today = new Date(); return d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); };

    return (
      <div className="animate-in fade-in duration-500 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
              <div className="flex gap-2">
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 border rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold border rounded-lg hover:bg-slate-50">Today</button>
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 border rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
              </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden flex-1">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase flex items-center justify-center">{d}</div>
               ))}
               {emptySlots.map((_, i) => (<div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]"></div>))}
               {daySlots.map((day) => {
                  const dateStr = new Date(year, month, day).toDateString();
                  const dayTasks = tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === dateStr);
                  return (
                      <div key={day} className={`bg-white p-2 min-h-[80px] hover:bg-slate-50 transition-colors relative flex flex-col gap-1 ${isToday(day) ? 'bg-indigo-50/30' : ''}`}>
                          <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>{day}</span>
                          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] no-scrollbar">
                              {dayTasks.map(t => (
                                  <div key={t.id} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded truncate border border-indigo-200" title={t.title}>{t.title}</div>
                              ))}
                          </div>
                      </div>
                  );
               })}
          </div>
      </div>
    );
};

export default CalendarView;
