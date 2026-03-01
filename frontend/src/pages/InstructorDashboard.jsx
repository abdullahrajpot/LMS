import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, BarChart2, Book, CheckCircle2, FileText, Link, PlayCircle, Loader2 } from 'lucide-react';

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', details: '', duration: '' });

    // UI State for Modals
    const [analyticsModal, setAnalyticsModal] = useState({ isOpen: false, courseId: null, data: null, loading: false });
    const [resourceModal, setResourceModal] = useState({ isOpen: false, courseId: null });
    const [newResource, setNewResource] = useState({ title: '', type: 'video', docUrl: '', videoUrl: '', description: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const myCourses = res.data.filter(c => c.instructor?._id === user._id);
            setCourses(myCourses);
        } catch (error) {
            console.error('Error fetching courses', error);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/courses', newCourse, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNewCourse({ title: '', description: '', details: '', duration: '' });
            setShowAddCourse(false);
            fetchCourses();
        } catch (error) {
            console.error('Creation failed', error);
        }
    };

    const handleOpenAnalytics = async (courseId) => {
        setAnalyticsModal({ isOpen: true, courseId, data: null, loading: true });
        try {
            const res = await axios.get(`http://localhost:5000/api/courses/${courseId}/analytics`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAnalyticsModal({ isOpen: true, courseId, data: res.data, loading: false });
        } catch (error) {
            console.error('Failed to load analytics', error);
            setAnalyticsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/resources', {
                ...newResource,
                courseId: resourceModal.courseId,
                contentUrl: newResource.docUrl || newResource.videoUrl || ' '
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setResourceModal({ isOpen: false, courseId: null });
            setNewResource({ title: '', type: 'video', docUrl: '', videoUrl: '', description: '' });
            alert("Resource added successfully");
        } catch (error) {
            console.error('Failed to add resource', error);
            alert("Failed to add resource");
        }
    };

    return (
        <div className="animate-slide-up max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Manage your courses, resources, and view detailed analytics.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddCourse(!showAddCourse)}
                >
                    <Plus size={18} /> {showAddCourse ? 'Cancel' : 'Create Course'}
                </button>
            </div>

            {/* General Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="panel flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Book size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Active Courses</p>
                        <p className="text-2xl font-bold text-slate-800">{courses.length}</p>
                    </div>
                </div>
                <div className="panel flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Enrollment</p>
                        <p className="text-2xl font-bold text-slate-800">
                            {courses.reduce((sum, c) => sum + c.enrolledLearners.length, 0)}
                        </p>
                    </div>
                </div>
                {/* Empty placeholder for alignment */}
                <div className="hidden md:block"></div>
            </div>

            {showAddCourse && (
                <div className="panel animate-slide-up mb-8 border-l-4 border-l-orange-500">
                    <h3 className="section-title mb-6">Create New Course</h3>
                    <form onSubmit={handleCreateCourse} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="input-label">Course Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Advanced Geometry"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="input-label">Short Description</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="A brief overview of the course"
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Detailed Course Info & Requirements</label>
                            <textarea
                                className="input-field resize-none"
                                rows="4"
                                placeholder="Explain the course in detail..."
                                value={newCourse.details}
                                onChange={e => setNewCourse({ ...newCourse, details: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Course Duration</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. 4 Weeks or 10 Hours"
                                value={newCourse.duration}
                                onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="btn btn-primary min-w-[150px]">Publish Course</button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                <h2 className="section-title mb-4">My Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length > 0 ? courses.map((course) => (
                        <div key={course._id} className="panel group flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`badge ${course.isActive ? 'badge-green' : 'badge-gray'}`}>
                                        {course.isActive ? 'Active' : 'Draft'}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                                        <Book size={12} /> {course.enrolledLearners.length} Students
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{course.title}</h3>
                                <p className="text-xs text-orange-500 font-semibold mb-2">{course.duration || 'Self-Paced'}</p>
                                <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <button
                                    className="btn btn-secondary w-full"
                                    onClick={() => handleOpenAnalytics(course._id)}
                                >
                                    <BarChart2 size={16} className="text-slate-400" /> <span className="text-xs">Analytics</span>
                                </button>
                                <button
                                    className="btn btn-secondary w-full"
                                    onClick={() => setResourceModal({ isOpen: true, courseId: course._id })}
                                >
                                    <Plus size={16} className="text-slate-400" /> <span className="text-xs">Resource</span>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="md:col-span-3 panel py-12 text-center text-slate-500">
                            <Book size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium text-slate-800 mb-2">No courses yet</p>
                            <p className="text-sm">Click 'Create Course' to get started and build your curriculum.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Modal */}
            {analyticsModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="section-title text-lg flex items-center gap-2">
                                <BarChart2 size={20} className="text-orange-500" /> Course Analytics
                            </h3>
                            <button className="text-slate-400 hover:text-slate-600" onClick={() => setAnalyticsModal({ isOpen: false, courseId: null, data: null })}>
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            {analyticsModal.loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-orange-500" size={32} />
                                </div>
                            ) : analyticsModal.data ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Enrolled</p>
                                            <p className="text-2xl font-bold text-slate-800">{analyticsModal.data.enrolledCount}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Resource Views</p>
                                            <p className="text-2xl font-bold text-slate-800">{analyticsModal.data.totalViews}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Quiz Starts</p>
                                            <p className="text-2xl font-bold text-slate-800">{analyticsModal.data.totalQuizStarts}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Time Spent</p>
                                            <p className="text-2xl font-bold text-slate-800 text-orange-600">
                                                {Math.round(analyticsModal.data.totalTimeSpentSeconds / 60)} <span className="text-sm text-slate-500">min</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Student Progress List */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">Student Progress Tracking</h4>
                                        {analyticsModal.data.studentProgress && analyticsModal.data.studentProgress.length > 0 ? (
                                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                {analyticsModal.data.studentProgress.map(student => (
                                                    <div key={student.id} className="bg-white border rounded-lg p-3 hover:shadow-sm transition">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div>
                                                                <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.email}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-semibold text-slate-700">{student.progress}%</p>
                                                                <p className="text-[10px] text-slate-400">Completion</p>
                                                            </div>
                                                        </div>
                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                                            <div
                                                                className={`h-2 rounded-full ${student.progress > 75 ? 'bg-emerald-500' : student.progress > 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                                                                style={{ width: `${student.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-1">
                                                            <span>Views: {student.views}</span>
                                                            <span>Quizzes: {student.quizzes}</span>
                                                            <span>Tasks Done: {student.completedTasks}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm text-slate-500 py-4 italic border rounded-lg bg-slate-50">
                                                No student data available yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 py-4">Failed to load data.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Resource Modal */}
            {resourceModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="section-title text-lg">Add Resource</h3>
                            <button className="text-slate-400 hover:text-slate-600" onClick={() => setResourceModal({ isOpen: false, courseId: null })}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddResource} className="p-6 space-y-4">
                            <div>
                                <label className="input-label">Resource Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={newResource.title}
                                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Type</label>
                                <select
                                    className="input-field appearance-none"
                                    value={newResource.type}
                                    onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                                >
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                    <option value="link">External Link</option>
                                    <option value="quiz">Quiz</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Document URL (Optional)</label>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="https://..."
                                    value={newResource.docUrl}
                                    onChange={e => setNewResource({ ...newResource, docUrl: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Video URL (Optional)</label>
                                <input
                                    type="url"
                                    className="input-field"
                                    placeholder="https://..."
                                    value={newResource.videoUrl}
                                    onChange={e => setNewResource({ ...newResource, videoUrl: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Description (Optional)</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    value={newResource.description}
                                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setResourceModal({ isOpen: false, courseId: null })}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Save Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InstructorDashboard;
