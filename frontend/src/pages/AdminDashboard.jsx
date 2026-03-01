import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Settings, Activity, Users, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchClusters();
    }, []);

    const fetchClusters = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ml/clusters', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setClusters(res.data);
        } catch (error) {
            console.error('Error fetching clusters');
        }
    };

    const triggerClustering = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await axios.post('http://localhost:5000/api/ml/cluster', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMessage(res.data.message);
            fetchClusters();
        } catch (error) {
            setMessage('Clustering failed');
        }
        setLoading(false);
    };

    return (
        <div className="container py-8">
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
                <div>
                    <h1 className="text-3xl mb-2">System Administration</h1>
                    <p className="text-secondary">Control Panel & AI Engine Settings</p>
                </div>
                <button className="btn btn-secondary" onClick={logout}>
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <div className="glass-panel p-6">
                        <h2 className="flex items-center gap-2 mb-6">
                            <Settings className="text-danger" /> ML Engine Control
                        </h2>
                        <p className="text-secondary text-sm mb-6">
                            The K-Means clustering algorithm normally runs as a nightly batch job. You can manually trigger calculation over the learner behavioral feature space here.
                        </p>
                        <button
                            className="btn btn-primary w-full"
                            onClick={triggerClustering}
                            disabled={loading}
                        >
                            <Activity size={18} /> {loading ? 'Computing Clusters...' : 'Trigger K-Means Clustering'}
                        </button>
                        {message && (
                            <div className="mt-4 p-3 bg-green-500 bg-opacity-20 text-green-300 rounded border border-green-500 border-opacity-30 text-sm text-center">
                                {message}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="glass-panel p-6">
                        <h2 className="flex items-center gap-2 mb-6">
                            <Users className="text-accent-primary" /> Current Clusters
                        </h2>
                        {clusters.length > 0 ? (
                            <div className="space-y-4">
                                {clusters.map((cluster) => (
                                    <div key={cluster._id} className="p-4 bg-gray-800 bg-opacity-50 rounded-md border border-gray-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">{cluster.clusterName}</span>
                                            <span className="px-2 py-1 text-xs rounded bg-blue-500 bg-opacity-20 text-blue-400">
                                                Size: {cluster.size}
                                            </span>
                                        </div>
                                        <div className="text-xs text-secondary grid grid-cols-2 gap-2">
                                            <div>Engagement: {cluster.centroidVector.timeNorm.toFixed(2)}</div>
                                            <div>Score Avg: {cluster.centroidVector.scoreNorm.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary text-sm text-center py-4">No clusters computed yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
