import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`main-content ${sidebarOpen ? '' : 'content-collapsed'}`}
        style={{
          marginLeft: sidebarOpen ? '260px' : '70px',
        }}
      >
        <Header onToggleSidebar={toggleSidebar} title={title} />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};
