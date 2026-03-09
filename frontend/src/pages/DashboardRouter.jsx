import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LearnerDashboard from './LearnerDashboard';
import LearnerTasks from './LearnerTasks';
import GlobalCourses from './GlobalCourses';
import InstructorDashboard from './InstructorDashboard';
import Profile from './Profile';
import Layout from '../components/Layout';

const DashboardRouter = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" />;

    return (
        <Layout>
            <Routes>
                {user.role === 'learner' && (
                    <Route path="/*">
                        <Route index element={<LearnerDashboard />} />
                        <Route path="dashboard" element={<LearnerDashboard />} />
                        <Route path="tasks" element={<LearnerTasks />} />
                        <Route path="courses" element={<GlobalCourses />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                )}
                {user.role === 'instructor' && <Route path="/*" element={<InstructorDashboard />} />}
                {/* Fallback */}
                <Route path="*" element={<Navigate to={`/dashboard`} />} />
            </Routes>
        </Layout>
    );
};

export default DashboardRouter;
