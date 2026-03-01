import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    ClipboardList,
    BookOpen,
    Users,
    Calendar,
    Map,
    Newspaper,
    Activity,
    UserCircle
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        if (user && user.role === 'learner') {
            fetchTaskCount();
        }
    }, [user]);

    const fetchTaskCount = async () => {
        try {
            const coursesRes = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const enrolledCourses = coursesRes.data.filter(c => c.enrolledLearners.includes(user._id));

            let count = 0;
            for (const course of enrolledCourses) {
                const res = await axios.get(`http://localhost:5000/api/resources/course/${course._id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                count += res.data.length;
            }
            setTaskCount(count);
        } catch (error) {
            console.error('Error fetching task count for sidebar', error);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My tasks', path: '/tasks', icon: <ClipboardList size={20} />, badge: taskCount > 0 ? taskCount : null },
        { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
        { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0 overflow-y-auto">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-red-500 rounded-md flex items-center justify-center text-white font-bold text-lg">
                    Q
                </div>
                <span className="text-xl font-semibold text-white tracking-wide">Qurtubiks</span>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                {navItems.map((item, idx) => {
                    if (item.type === 'header') {
                        return (
                            <div key={idx} className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 tracking-wider">
                                {item.name}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={idx}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-200
                                ${isActive
                                    ? 'bg-orange-500/10 text-orange-500 border-l-4 border-orange-500'
                                    : 'hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </div>
                            {item.badge && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
