import React, { useState, useRef } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { DEPARTMENTS, THEME_COLORS } from '../constants';
import { User as UserIcon, Mail, Phone, Briefcase, Camera, Save, CheckCircle, Upload, Palette, Moon, Sun } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  onThemeChange: (color: string) => void;
  onDarkModeChange: (isDark: boolean) => void;
  isDarkMode: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onThemeChange, onDarkModeChange, isDarkMode }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme from user or storage default
  const [selectedTheme, setSelectedTheme] = useState(user.themeColor || 'indigo');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeSelect = (color: string) => {
    setSelectedTheme(color);
    onThemeChange(color); // Update App state immediately
    setFormData(prev => ({ ...prev, themeColor: color }));
    storageService.saveTheme(color); // Save preference globally
  };

  const toggleDarkMode = () => {
      const newMode = !isDarkMode;
      onDarkModeChange(newMode);
      storageService.saveDarkMode(newMode);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size is too large. Please select an image under 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...formData, isDarkMode: isDarkMode };
    storageService.saveUser(updatedUser);
    onUpdate(updatedUser);
    setIsEditing(false);
    setMessage("Profile updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        {/* Cover / Header */}
        <div className={`h-40 bg-gradient-to-r from-${selectedTheme}-800 to-${selectedTheme}-900 relative overflow-hidden transition-colors duration-500`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="px-8 pb-10">
           <div className="relative flex flex-col md:flex-row justify-between items-end -mt-14 mb-8 gap-4">
              <div 
                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
                title={isEditing ? "Click to upload photo" : ""}
              >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <div className={`w-28 h-28 rounded-2xl border-[6px] border-white dark:border-slate-900 bg-white dark:bg-slate-900 shadow-lg overflow-hidden relative transition-all ${isEditing ? `ring-4 ring-${selectedTheme}-100 dark:ring-${selectedTheme}-900` : ''}`}>
                    <img 
                        src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    )}
                </div>
                {isEditing && (
                    <div className={`absolute -bottom-2 -right-2 bg-${selectedTheme}-600 text-white p-1.5 rounded-lg shadow-sm z-10 border-2 border-white dark:border-slate-900`}>
                        <Upload size={14} />
                    </div>
                )}
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm"
                >
                  Edit Information
                </button>
              ) : (
                 <div className="flex gap-2">
                     <button 
                        onClick={() => { 
                            setIsEditing(false); 
                            setFormData(user); 
                            setSelectedTheme(user.themeColor || 'indigo'); 
                            onThemeChange(user.themeColor || 'indigo');
                        }}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                     >
                        Cancel
                    </button>
                 </div>
              )}
           </div>

           {message && (
             <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <CheckCircle size={18} /> {message}
             </div>
           )}

           <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            <UserIcon size={18} />
                        </div>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-${selectedTheme}-500/20 focus:border-${selectedTheme}-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 transition-all outline-none font-medium`}
                        />
                     </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            <Mail size={18} />
                        </div>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-${selectedTheme}-500/20 focus:border-${selectedTheme}-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 transition-all outline-none font-medium`}
                        />
                     </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            <Phone size={18} />
                        </div>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-${selectedTheme}-500/20 focus:border-${selectedTheme}-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 transition-all outline-none font-medium`}
                        />
                     </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</label>
                     <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            <Briefcase size={18} />
                        </div>
                        <select 
                            name="department" 
                            value={formData.department}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-${selectedTheme}-500/20 focus:border-${selectedTheme}-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 transition-all outline-none appearance-none font-medium`}
                        >
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                     </div>
                  </div>
              </div>

              {/* Theme & Appearance */}
              {isEditing && (
                 <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                <Palette size={16} /> Interface Theme
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {THEME_COLORS.map(theme => (
                                    <button
                                        key={theme.value}
                                        type="button"
                                        onClick={() => handleThemeSelect(theme.value)}
                                        className={`group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${selectedTheme === theme.value ? `border-${theme.value}-500 bg-${theme.value}-50 dark:bg-${theme.value}-900/20` : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full shadow-sm bg-${theme.value}-500 flex items-center justify-center text-white transition-transform group-hover:scale-110`}>
                                            {selectedTheme === theme.value && <CheckCircle size={20} />}
                                        </div>
                                        <span className={`text-xs font-medium ${selectedTheme === theme.value ? `text-${theme.value}-700 dark:text-${theme.value}-400` : 'text-slate-500 dark:text-slate-400'}`}>
                                            {theme.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                <Moon size={16} /> Display Mode
                            </label>
                            <button
                                type="button"
                                onClick={toggleDarkMode}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isDarkMode ? `border-slate-700 bg-slate-800` : 'border-slate-200 bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-white text-slate-500 shadow-sm'}`}>
                                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {isDarkMode ? 'Easy on the eyes in low light' : 'Standard professional appearance'}
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? `bg-${selectedTheme}-600` : 'bg-slate-300'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </button>
                        </div>
                    </div>
                 </div>
              )}

              {isEditing && (
                 <div className="mt-10 flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button 
                       type="submit" 
                       className={`px-6 py-2.5 bg-${selectedTheme}-600 text-white rounded-lg text-sm font-semibold hover:bg-${selectedTheme}-700 shadow-lg shadow-${selectedTheme}-600/20 transition-all flex items-center gap-2`}
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