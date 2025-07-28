import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, History, Settings, Home } from 'lucide-react';
import championLogo from '@/assets/champions-league-logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/groups', icon: Users, label: 'Groups' },
    { path: '/fixtures', icon: Calendar, label: 'Fixtures' },
    { path: '/knockout', icon: Trophy, label: 'Knockout' },
    { path: '/history', icon: History, label: 'Match History' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="champions-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={championLogo} 
                alt="Champions League" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                 E-UEFA Champions League
                </h1>
                <p className="text-sm text-muted-foreground">
                  Professional League Manager
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/admin">
                <Button variant="admin" size="sm">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-primary-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="champions-card border-b">
        <div className="container mx-auto px-4">
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row md:space-x-8 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-primary-foreground hover:bg-accent'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile admin link */}
              <Link
                to="/admin"
                className="md:hidden flex items-center space-x-2 px-4 py-2 rounded-md text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="champions-card border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2025 Efootball UEFA Champions League Manager - Efootball Uefa style Made Easy
            </p>
            <p className="text-sm text-muted-foreground mt-2">
             Made with 🌀ProfKhamis - Kirinyaga University
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
