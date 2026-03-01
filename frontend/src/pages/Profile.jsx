import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Award, Loader2, Calendar, Target, Flame } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfileData(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)] text-slate-500">
                Failed to load profile data.
            </div>
        );
    }

    return (
        <div className="animate-slide-up max-w-4xl mx-auto space-y-8 p-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and view your learning journey.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Basic Info Card */}
                <div className="md:col-span-1">
                    <div className="panel bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl overflow-hidden relative">
                        {/* Decorative Background blob */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl"></div>

                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg mb-4 ring-4 ring-white/10">
                                {profileData.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold mb-1">{profileData.name}</h2>
                            <p className="text-orange-300 text-sm font-semibold uppercase tracking-wider mb-6">{profileData.role}</p>

                            <div className="w-full space-y-3 text-left bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="truncate">{profileData.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>Joined {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Interests */}
                <div className="md:col-span-2 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="panel flex items-center gap-4 bg-orange-50/50 border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                <Flame size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Current Streak</p>
                                <p className="text-2xl font-bold text-slate-800">{profileData.streakDays || 0} Days</p>
                            </div>
                        </div>
                        <div className="panel flex items-center gap-4 bg-blue-50/50 border border-blue-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Certificates</p>
                                <p className="text-2xl font-bold text-slate-800">{profileData.certificates || 0} Earned</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Profile Details */}
                    <div className="panel border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Target className="text-orange-500" size={20} />
                            <h3 className="text-lg font-bold text-slate-800">Learning Profile</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Topics of Interest */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-3">Onboarding Interests</h4>
                                {profileData.onboardingQuiz && profileData.onboardingQuiz.interests && profileData.onboardingQuiz.interests.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.onboardingQuiz.interests.map((interest, idx) => (
                                            <span key={idx} className="badge badge-gray text-xs px-3 py-1.5">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg">No specific interests recorded yet. Complete onboarding AI quizzes to populate this.</p>
                                )}
                            </div>

                            {/* Preference Settings */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-3">Activity Profile</h4>
                                {profileData.onboardingQuiz ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Time Availability</p>
                                            <p className="text-sm font-medium text-slate-700 capitalize">{profileData.onboardingQuiz.timePerWeek || 'Not set'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Pace Preference</p>
                                            <p className="text-sm font-medium text-slate-700 capitalize">{profileData.onboardingQuiz.learningPace || 'Not set'}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-400 mb-1">Current Level</p>
                                            <p className="text-sm font-medium text-slate-700 capitalize">{profileData.onboardingQuiz.skillLevel || 'Beginner'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">Settings not configured.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
