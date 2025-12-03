
import React from 'react';
import { Plus, CheckCircle, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
import { Task } from '../../../types-admin-final';

interface TasksViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onUpdateTask }) => {
  return (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
                   <p className="text-slate-500 text-sm">Follow-ups and to-dos</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> New Task
              </button>
          </div>
          <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
              {tasks.map(task => (
                  <div key={task.id} className={`p-4 rounded-xl border transition-all ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                      <div className="flex items-start gap-4">
                          <button 
                            onClick={() => onUpdateTask({...task, completed: !task.completed})}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-0.5 ${
                                task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                              {task.completed && <CheckCircle className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                              <h3 className={`font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarIcon className="w-3.5 h-3.5" />{new Date(task.dueDate).toLocaleDateString()}</div>
                                  {task.leadName && (<div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-medium"><UserIcon className="w-3 h-3" />{task.leadName}</div>)}
                                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{task.priority}</div>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default TasksView;
