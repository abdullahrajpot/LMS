import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, PlayCircle, FileText, Link as LinkIcon, HelpCircle, Loader2 } from 'lucide-react';

const LearnerTasks = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // First, get courses the learner is enrolled in
            const coursesRes = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const enrolledCourses = coursesRes.data.filter(c => c.enrolledLearners.includes(user._id));

            // Then, fetch resources for each enrolled course
            let allResources = [];
            for (const course of enrolledCourses) {
                const res = await axios.get(`http://localhost:5000/api/resources/course/${course._id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                // Add course info to each resource
                const resourcesWithCourse = res.data.map(r => ({ ...r, courseTitle: course.title }));
                allResources = [...allResources, ...resourcesWithCourse];
            }

            // Sort by newest first
            allResources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTasks(allResources);
        } catch (error) {
            console.error('Error fetching tasks/resources', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return <PlayCircle className="text-orange-500" />;
            case 'document': return <FileText className="text-blue-500" />;
            case 'link':
            case 'external_link': return <LinkIcon className="text-emerald-500" />;
            case 'quiz': return <HelpCircle className="text-purple-500" />;
            default: return <ClipboardList className="text-slate-500" />;
        }
    };

    return (
        <div className="animate-slide-up max-w-5xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <ClipboardList className="text-orange-500" size={32} />
                    My Tasks
                </h1>
                <p className="text-slate-500 font-medium">
                    Resources and assignments from your enrolled courses.
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-orange-500" size={48} />
                </div>
            ) : tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((task, index) => (
                        <div
                            key={task._id}
                            className="panel hover:shadow-md transition-shadow flex items-start gap-4 cursor-pointer hover:border-orange-500/30"
                            onClick={() => setSelectedTask(task)}
                        >
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                                {getIconForType(task.type)}
                                <span className="text-[10px] font-bold text-slate-400 mt-1 mt-2">
                                    T{tasks.length - index}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                        {task.courseTitle}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                        {task.type.toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{task.title}</h3>
                                {task.description && (
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {task.docUrl && (
                                        <a
                                            href={task.docUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <FileText size={16} /> Read Doc
                                        </a>
                                    )}
                                    {task.videoUrl && (
                                        <a
                                            href={task.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors"
                                        >
                                            <PlayCircle size={16} /> Watch Video
                                        </a>
                                    )}
                                    {!task.docUrl && !task.videoUrl && task.contentUrl && (
                                        <a
                                            href={task.contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors"
                                        >
                                            <LinkIcon size={16} /> Open Resource
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="panel py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <ClipboardList size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tasks yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        You don't have any pending resources or tasks. Enroll in courses to start seeing tasks here!
                    </p>
                </div>
            )}

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                                    {getIconForType(selectedTask.type)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-orange-500">{selectedTask.courseTitle}</p>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedTask.title}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50">
                            <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Instructions & Details</h4>
                            <p className="text-slate-600 mb-6 whitespace-pre-wrap">
                                {selectedTask.description || "No specific instructions provided for this resource."}
                            </p>

                            <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide">Materials</h4>
                            <div className="flex flex-col gap-3">
                                {selectedTask.docUrl && (
                                    <a
                                        href={selectedTask.docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                        <FileText size={18} /> Open Document Link
                                    </a>
                                )}
                                {selectedTask.videoUrl && (
                                    <a
                                        href={selectedTask.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                                    >
                                        <PlayCircle size={18} /> View Video Material
                                    </a>
                                )}
                                {!selectedTask.docUrl && !selectedTask.videoUrl && selectedTask.contentUrl && (
                                    <a
                                        href={selectedTask.contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50"
                                    >
                                        <LinkIcon size={18} /> Visit Resource Link
                                    </a>
                                )}
                                {!selectedTask.docUrl && !selectedTask.videoUrl && !selectedTask.contentUrl && (
                                    <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                                        <HelpCircle size={16} /> No attached links available for this task.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                className="btn btn-primary"
                                onClick={() => setSelectedTask(null)}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearnerTasks;
