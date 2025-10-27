import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Analytics Page
 *
 * Displays comprehensive analytics dashboard for the onboarding program
 */
const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [documentPerformance, setDocumentPerformance] = useState([]);
  const [dateRange, setDateRange] = useState(30);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, docPerformanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/overview?dateRange=${dateRange}`),
        axios.get(`${API_BASE_URL}/analytics/document-performance`),
      ]);

      setAnalytics(overviewRes.data.data);
      setDocumentPerformance(docPerformanceRes.data.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={loadAnalytics} className="mt-2 text-sm text-red-600 hover:text-red-700 underline">
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-gray-500">No analytics data available</div>;
  }

  const { documentGeneration, clientEngagement, programProgress, providerBreakdown, documentsPerDay } = analytics;

  // Colors for charts
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

  // Prepare provider data for pie chart
  const providerData = [
    { name: 'OpenAI', value: providerBreakdown.openai },
    { name: 'Claude', value: providerBreakdown.claude },
    { name: 'Gemini', value: providerBreakdown.gemini },
  ].filter((item) => item.value > 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Onboarding program performance insights</p>
        </div>

        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 6 months</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<DocumentTextIcon className="h-8 w-8 text-blue-500" />}
          title="Documents Generated"
          value={documentGeneration.totalGenerated}
          subtitle={`${documentGeneration.successRate}% success rate`}
          color="bg-blue-50"
        />
        <MetricCard
          icon={<CheckCircleIcon className="h-8 w-8 text-green-500" />}
          title="Total Approvals"
          value={clientEngagement.totalApprovals}
          subtitle={`${clientEngagement.totalRevisions} revisions`}
          color="bg-green-50"
        />
        <MetricCard
          icon={<ClockIcon className="h-8 w-8 text-purple-500" />}
          title="Avg Generation Time"
          value={`${documentGeneration.avgGenerationTimeSeconds}s`}
          subtitle={`${Math.round(documentGeneration.avgTokensPerDocument).toLocaleString()} tokens avg`}
          color="bg-purple-50"
        />
        <MetricCard
          icon={<UserGroupIcon className="h-8 w-8 text-orange-500" />}
          title="Active Clients"
          value={programProgress.activeClients}
          subtitle={`${programProgress.monthsCompleted} months completed`}
          color="bg-orange-50"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Documents Per Day */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Documents Generated Over Time</h3>
          {documentsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={documentsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} name="Documents" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        {/* Provider Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">LLM Provider Distribution</h3>
          {providerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={providerData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Client Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{clientEngagement.totalViews}</p>
            <p className="text-sm text-gray-600 mt-1">Total Views</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{clientEngagement.avgTimeToViewHours}h</p>
            <p className="text-sm text-gray-600 mt-1">Avg Time to View</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{clientEngagement.avgTimeToApprovalDays}d</p>
            <p className="text-sm text-gray-600 mt-1">Avg Time to Approval</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{clientEngagement.revisionRate}%</p>
            <p className="text-sm text-gray-600 mt-1">Revision Rate</p>
          </div>
        </div>
      </div>

      {/* Document Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top Document Performance</h3>
        {documentPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approvals</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revision Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentPerformance.slice(0, 10).map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.documentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.timesGenerated}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.avgGenerationTimeSeconds}s</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.approvals}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.revisionRate > 30 ? 'bg-red-100 text-red-800' : doc.revisionRate > 15 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {doc.revisionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No document performance data available</p>
        )}
      </div>
    </div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard = ({ icon, title, value, subtitle, color }) => {
  return (
    <div className={`card ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="ml-4">{icon}</div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
