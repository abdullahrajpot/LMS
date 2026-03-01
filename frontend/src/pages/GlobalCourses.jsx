import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Clock, Search, Filter, Loader2, Users } from 'lucide-react';

const GlobalCourses = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Refresh to update enrollment status
            fetchCourses();
        } catch (error) {
            console.error('Enrollment failed', error);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-slide-up max-w-6xl mx-auto space-y-8">
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <BookOpen className="text-orange-500" size={32} />
                        All Courses
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Browse our complete catalog and discover new skills.
                    </p>
                </div>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={18} />
                    </div>
                    <input
                        type="text"
                        className="input-field pl-10"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-orange-500" size={48} />
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => {
                        const isEnrolled = course.enrolledLearners.includes(user._id);
                        return (
                            <div
                                key={course._id}
                                className="panel flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer border hover:border-orange-500/30"
                                onClick={() => setSelectedCourse(course)}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`badge ${isEnrolled ? 'badge-blue' : 'badge-gray'}`}>
                                            {isEnrolled ? 'In Progress' : 'Available'}
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
                <div className="panel py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No courses found</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        We couldn't find any courses matching "{searchTerm}". Try adjusting your search criteria.
                    </p>
                </div>
            )}

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

export default GlobalCourses;
