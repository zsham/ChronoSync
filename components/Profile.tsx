import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { DEPARTMENTS } from '../constants';
import { User as UserIcon, Mail, Phone, Briefcase, Camera, Save, CheckCircle, X } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveUser(formData);
    onUpdate(formData);
    setIsEditing(false);
    setMessage("Profile updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-slate-500 mt-1">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
        {/* Cover / Header */}
        <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="px-8 pb-10">
           <div className="relative flex flex-col md:flex-row justify-between items-end -mt-14 mb-8 gap-4">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-2xl border-[6px] border-white bg-white shadow-lg overflow-hidden relative">
                    <img 
                        src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                </div>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  Edit Information
                </button>
              ) : (
                 <div className="flex gap-2">
                     <button 
                        onClick={() => { setIsEditing(false); setFormData(user); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                     >
                        Cancel
                    </button>
                 </div>
              )}
           </div>

           {message && (
             <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <CheckCircle size={18} /> {message}
             </div>
           )}

           <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <UserIcon size={18} />
                        </div>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all outline-none font-medium text-slate-800"
                        />
                     </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail size={18} />
                        </div>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all outline-none font-medium text-slate-800"
                        />
                     </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Phone size={18} />
                        </div>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all outline-none font-medium text-slate-800"
                        />
                     </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Briefcase size={18} />
                        </div>
                        <select 
                            name="department" 
                            value={formData.department}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all outline-none appearance-none font-medium text-slate-800 bg-white"
                        >
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                     </div>
                  </div>
              </div>

              {isEditing && (
                 <div className="mt-10 flex justify-end pt-6 border-t border-slate-100">
                    <button 
                       type="submit" 
                       className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2"
                    >
                       <Save size={18} /> Save Changes
                    </button>
                 </div>
              )}
           </form>
        </div>
      </div>
    </div>
  );
};