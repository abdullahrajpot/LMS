import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main content area shifted by sidebar width */}
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
