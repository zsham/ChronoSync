import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { User, Tab } from './types';
import { MOCK_USER } from './constants';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { Report } from './components/Report';
import { LayoutDashboard, UserCircle, FileBarChart, LogOut, Clock, Shield, Menu, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [emailInput, setEmailInput] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [themeColor, setThemeColor] = useState<string>('indigo');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // 1. Load global theme preference (saved on machine)
    const storedTheme = storageService.getTheme();
    setThemeColor(storedTheme);
    
    // 2. Load dark mode preference
    const storedDarkMode = storageService.getDarkMode();
    setIsDarkMode(storedDarkMode);
    if (storedDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 3. Load user session
    const storedUser = storageService.getUser();
    if (storedUser) {
      setUser(storedUser);
      // If user has a specific saved theme, override the machine default
      if (storedUser.themeColor) {
        setThemeColor(storedUser.themeColor);
        storageService.saveTheme(storedUser.themeColor);
      }
      // If user has saved dark mode preference
      if (storedUser.isDarkMode !== undefined) {
         setIsDarkMode(storedUser.isDarkMode);
         storageService.saveDarkMode(storedUser.isDarkMode);
         if (storedUser.isDarkMode) {
             document.documentElement.classList.add('dark');
         } else {
             document.documentElement.classList.remove('dark');
         }
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    // Simulate login: use mock user but allow email override
    const loggedInUser = { 
        ...MOCK_USER, 
        email: emailInput, 
        themeColor: themeColor,
        isDarkMode: isDarkMode
    };
    storageService.saveUser(loggedInUser);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    storageService.clearAll(); // Clears user session
    // We want to KEEP the theme/dark mode for the next login
    storageService.saveTheme(themeColor); 
    storageService.saveDarkMode(isDarkMode);
    setUser(null);
    setEmailInput('');
  };

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
  };

  const handleDarkModeChange = (isDark: boolean) => {
    setIsDarkMode(isDark);
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    if (user) {
        // Update current user state so it doesn't get out of sync
        const updatedUser = { ...user, isDarkMode: isDark };
        setUser(updatedUser);
        storageService.saveUser(updatedUser);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-${themeColor}-100/50 dark:bg-${themeColor}-900/20 blur-[100px] opacity-70 transition-colors duration-700`}></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-slate-100/50 dark:bg-slate-900/20 blur-[100px] opacity-70"></div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 dark:border-slate-800/60 w-full max-w-md relative z-10 transition-all hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.15)]">
            <div className="flex flex-col items-center mb-10">
                <div className={`w-16 h-16 bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${themeColor}-500/30 mb-6 transition-colors duration-500`}>
                    <Clock size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">ChronoSync</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Enterprise Time Management</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Work Email</label>
                    <input 
                        type="email" 
                        required
                        className={`w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-${themeColor}-500/20 focus:border-${themeColor}-500 outline-none transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder-slate-400`}
                        placeholder="name@company.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-slate-900/20"
                >
                    Access Workspace
                </button>
            </form>
            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
                <p className="text-xs text-slate-400 font-medium">© 2025 ChronoSync Inc. Professional Suite</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1 font-mono">Code Design by z@ShAm Malaysia Anonymous</p>
            </div>
        </div>
      </div>
    );
  }

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button 
        onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm duration-200 group
        ${activeTab === tab 
            ? `bg-${themeColor}-50 dark:bg-${themeColor}-900/30 text-${themeColor}-700 dark:text-${themeColor}-400 shadow-sm` 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
    >
        <Icon size={20} className={`transition-colors ${activeTab === tab ? `text-${themeColor}-600 dark:text-${themeColor}-400` : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} /> 
        {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50/50 dark:bg-black overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20 transition-colors duration-200">
        <div className="p-8 flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
                <Shield size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">ChronoSync</span>
        </div>

        <nav className="flex-1 px-6 space-y-2">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
            <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem tab={Tab.REPORT} icon={FileBarChart} label="Analytics & Reports" />
            
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-8 mb-4 px-2">Account</div>
            <NavItem tab={Tab.PROFILE} icon={UserCircle} label="My Profile" />
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`w-10 h-10 rounded-full bg-${themeColor}-100 dark:bg-${themeColor}-900/50 flex items-center justify-center text-${themeColor}-700 dark:text-${themeColor}-400 font-bold overflow-hidden transition-colors`}>
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.position}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900/30 transition-all text-sm font-medium"
            >
                <LogOut size={16} /> Sign Out
            </button>
            <div className="mt-4 text-center">
                 <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">Code Design by z@ShAm Malaysia Anonymous</p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA] dark:bg-slate-950 transition-colors duration-200">
         {/* Mobile Header */}
         <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center z-30 sticky top-0">
            <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900">
                    <Shield size={16} fill="currentColor" />
                </div>
                <span className="font-bold text-slate-800 dark:text-white text-lg">ChronoSync</span>
            </div>
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </header>

         {/* Mobile Menu Overlay */}
         {isMobileMenuOpen && (
             <div className="md:hidden absolute inset-0 bg-white dark:bg-slate-900 z-20 pt-20 px-4 space-y-4">
                 <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                 <NavItem tab={Tab.REPORT} icon={FileBarChart} label="Analytics & Reports" />
                 <NavItem tab={Tab.PROFILE} icon={UserCircle} label="My Profile" />
                 <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium">
                        <LogOut size={20} /> Sign Out
                    </button>
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono text-center mt-4">Code Design by z@ShAm Malaysia Anonymous</p>
                 </div>
             </div>
         )}

         {/* Scrollable Content */}
         <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                {activeTab === Tab.DASHBOARD && <Dashboard user={user} themeColor={themeColor} />}
                {activeTab === Tab.PROFILE && (
                    <Profile 
                        user={user} 
                        onUpdate={(u) => { setUser(u); storageService.saveUser(u); }} 
                        onThemeChange={handleThemeChange} 
                        onDarkModeChange={handleDarkModeChange}
                        isDarkMode={isDarkMode}
                    />
                )}
                {activeTab === Tab.REPORT && <Report themeColor={themeColor} />}
            </div>
         </main>
      </div>
    </div>
  );
}