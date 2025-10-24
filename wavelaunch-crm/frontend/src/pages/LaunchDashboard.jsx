import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Launch Dashboard Page
 *
 * CEO overview of all pre-launch activity:
 * - Who's ready to launch
 * - Who's stuck
 * - Launch schedule
 * - Daily alerts
 */
const LaunchDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, briefingRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/launch/dashboard`),
        axios.get(`${API_BASE_URL}/launch/briefing`),
      ]);

      setDashboard(dashboardRes.data.data);
      setBriefing(briefingRes.data.data);
    } catch (error) {
      console.error('Error loading launch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading launch dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Launch Dashboard</h1>
          <p className="text-gray-600 mt-1">Pre-launch management overview</p>
        </div>
        <button
          onClick={loadDashboard}
          className="btn btn-secondary"
        >
          Refresh
        </button>
      </div>

      {/* CEO Briefing Summary */}
      {briefing && briefing.summary.totalAlerts > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <BellAlertIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {briefing.summary.urgentActions} Urgent Action{briefing.summary.urgentActions !== 1 ? 's' : ''} Needed
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {briefing.urgentActions.slice(0, 3).map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready to Launch</p>
              <p className="text-3xl font-bold text-green-600">{dashboard?.readyToLaunch || 0}</p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Launching This Week</p>
              <p className="text-3xl font-bold text-blue-600">{dashboard?.launchingThisWeek || 0}</p>
            </div>
            <RocketLaunchIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stuck / Blocked</p>
              <p className="text-3xl font-bold text-red-600">{dashboard?.stuck || 0}</p>
            </div>
            <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Attention</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboard?.needsAttention || 0}</p>
            </div>
            <ClockIcon className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Launches This Week */}
      {briefing && briefing.launches.thisWeek.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Launches This Week</h2>
          <div className="space-y-3">
            {briefing.launches.thisWeek.map((launch, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">{launch.name}</p>
                  <p className="text-sm text-gray-600">
                    {launch.daysUntil === 0 ? 'Today!' : `In ${launch.daysUntil} days`}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`badge ${launch.isReady ? 'badge-green' : 'badge-yellow'}`}>
                    {launch.readinessScore}% Ready
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Alerts */}
      {briefing && briefing.clientAlerts.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">⚠️ Client Alerts</h2>
          <div className="space-y-3">
            {briefing.clientAlerts.slice(0, 5).map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start p-3 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-50' : 'bg-yellow-50'
                }`}
              >
                <ExclamationTriangleIcon
                  className={`h-5 w-5 mt-0.5 mr-3 ${
                    alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Readiness by Stage */}
      {dashboard && dashboard.readinessByStage && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📊 Readiness by Stage</h2>
          <div className="space-y-4">
            {Object.entries(dashboard.readinessByStage).map(([stage, data]) => (
              <div key={stage}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{stage}</span>
                  <span className="text-gray-600">
                    {data.count} client{data.count !== 1 ? 's' : ''} • Avg: {data.avgReadiness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      data.avgReadiness >= 80
                        ? 'bg-green-500'
                        : data.avgReadiness >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${data.avgReadiness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Wins */}
      {briefing && briefing.wins.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">🎉 Recent Wins</h2>
          <div className="space-y-2">
            {briefing.wins.slice(0, 5).map((win, idx) => (
              <div key={idx} className="flex items-center p-2 bg-green-50 rounded">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                <p className="text-sm">{win.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchDashboard;
