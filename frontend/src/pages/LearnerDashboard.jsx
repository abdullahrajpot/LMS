import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, Clock, CheckCircle, Search, Sparkles, BookOpen, Users, FileText, Compass, Award, TrendingUp, Star } from 'lucide-react';

const LearnerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [stats, setStats] = useState({ activeCourses: 0, completedCourses: 0, totalHours: 0, streakDays: 0, certificates: 0 });

    useEffect(() => {
        fetchCourses();
        fetchRecommendations();
        fetchStats();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ml/recommendations', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRecommendations(res.data);
        } catch (error) {
            console.error('Error fetching recommendations', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Assuming profile returns these, mapping placeholder if they don't exist yet
            setStats({
                certificates: res.data.certificates?.length || 0,
                streakDays: res.data.streakDays || 0
            });
        } catch (error) {
            console.error('Error fetching stats', error);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchCourses();
        } catch (error) {
            console.error('Enrollment failed', error);
        }
    };

    return (
        <div className="animate-slide-up max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome back, {user.name}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                    <Compass size={16} /> Continue your learning journey today.
                </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="panel flex items-center justify-between group cursor-pointer hover:border-orange-500 hover:shadow-md transition">
                    <div>
                        <p className="section-subtitle">Courses in Progress</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">
                            {courses.filter(c => c.enrolledLearners.includes(user._id)).length}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <BookOpen size={24} />
                    </div>
                </div>
                <div className="panel flex items-center justify-between group cursor-pointer hover:border-emerald-500 hover:shadow-md transition">
                    <div>
                        <p className="section-subtitle">Certificates</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.certificates}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <Award size={24} />
                    </div>
                </div>
                <div className="panel flex items-center justify-between group cursor-pointer hover:border-blue-500 hover:shadow-md transition">
                    <div>
                        <p className="section-subtitle">Study Streak</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.streakDays} <span className="text-lg font-medium text-slate-500">days</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* AI Recommendations Section */}
            <section className="bg-slate-900 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

                <h2 className="flex items-center gap-2 text-2xl font-bold mb-6 relative z-10">
                    <Star className="text-yellow-400 fill-yellow-400" /> Personalized for You
                </h2>

                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {recommendations.map((rec) => (
                            <div key={rec._id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl hover:bg-slate-800 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-orange-500/10 text-orange-400 p-2.5 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                        <PlayCircle size={24} />
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        {Math.round(rec.similarityScore * 100)}% Match
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 line-clamp-1">{rec.resource?.title || 'Featured Content'}</h3>
                                <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">{rec.resource?.description || 'Based on your recent onboarding.'}</p>
                                <button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2.5 rounded-lg transition-colors text-sm">
                                    Access Content
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-xl text-center text-slate-400 relative z-10">
                        <Compass className="mx-auto mb-3 opacity-50" size={32} />
                        <p className="font-medium">Complete courses and quizzes to get personalized AI recommendations!</p>
                    </div>
                )}
            </section>

            {/* Available Courses -> Recommended Courses Only */}
            <section className="pt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="section-title flex items-center gap-2">
                        <BookOpen className="text-slate-400" /> Recommended Courses For You
                    </h2>
                </div>
                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses
                            // Filter logic: Only show courses that match an AI recommendation
                            // Assuming recommendations from ML link to either courses or resources 
                            // (we'll show courses that possess recommended resources or direct course recommendations)
                            .filter(c => recommendations.some(rec => rec.courseId === c._id || rec.resource?.course === c._id))
                            .map((course) => {
                                const isEnrolled = course.enrolledLearners.includes(user._id);
                                return (
                                    <div
                                        key={course._id}
                                        className="panel flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer border hover:border-orange-500/30"
                                        onClick={() => setSelectedCourse(course)}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`badge ${isEnrolled ? 'badge-blue' : 'badge-emerald'}`}>
                                                    {isEnrolled ? 'In Progress' : 'Highly Recommended'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-orange-600 transition-colors">
                                                {course.title}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-orange-500 font-semibold mb-2">
                                                <Clock size={12} />
                                                <span>{course.duration || 'Self-Paced'}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>

                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-6">
                                                <Users size={14} />
                                                <span>Inst: {course.instructor?.name || 'Community'}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`btn w-full ${isEnrolled ? 'btn-secondary text-blue-600 border-blue-200 hover:bg-blue-50' : 'btn-primary'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isEnrolled) handleEnroll(course._id);
                                            }}
                                        >
                                            {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                                        </button>
                                    </div>
                                )
                            })}
                    </div>
                ) : (
                    <div className="panel py-12 text-center text-slate-500">
                        <p>Complete your onboarding quiz to see courses tailored specifically to you here.</p>
                        <p className="text-sm mt-2">You can view all available courses in the 'Courses' tab.</p>
                    </div>
                )}
            </section>

            {/* Course Details Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-slate-100 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                    Course Overview
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedCourse.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <Clock size={14} className="text-orange-500" />
                                    <span className="font-semibold">{selectedCourse.duration || 'Self-Paced'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <Users size={14} className="text-slate-400" />
                                    <span className="font-medium">{selectedCourse.instructor?.name || 'Community'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50">
                            <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">About This Course</h4>
                            <p className="text-slate-600 mb-6 leading-relaxed whitespace-pre-wrap">
                                {selectedCourse.description}
                            </p>

                            {selectedCourse.details && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Syllabus & Requirements</h4>
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 text-slate-600 text-sm whitespace-pre-wrap">
                                        {selectedCourse.details}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                            <button
                                className="btn btn-secondary border-slate-200 hover:bg-slate-50 text-slate-600"
                                onClick={() => setSelectedCourse(null)}
                            >
                                Close
                            </button>
                            {!selectedCourse.enrolledLearners.includes(user._id) && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        handleEnroll(selectedCourse._id);
                                        setSelectedCourse(null);
                                    }}
                                >
                                    Enroll Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearnerDashboard;
