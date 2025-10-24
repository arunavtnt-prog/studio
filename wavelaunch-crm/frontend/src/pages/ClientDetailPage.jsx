import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import HealthBadge from '../components/common/HealthBadge';
import {
  DocumentIcon,
  EnvelopeIcon,
  FlagIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Client Detail Page
 *
 * Complete client profile with all related data:
 * - Profile information
 * - Journey progress
 * - Health score breakdown
 * - Files and documents
 * - Email communications
 * - Milestones
 * - Activity timeline
 */
const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const [clientRes, statsRes] = await Promise.all([
        clientsAPI.getById(id),
        clientsAPI.getStats(id),
      ]);

      setClient(clientRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshHealthScore = async () => {
    try {
      await clientsAPI.updateHealthScore(id);
      loadClient();
    } catch (error) {
      console.error('Error updating health score:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
            <p className="text-gray-600">{client.email}</p>
            {client.phone && <p className="text-gray-600">{client.phone}</p>}
          </div>
          <div className="text-right">
            <HealthBadge status={client.healthStatus} score={client.healthScore} />
            <button
              onClick={refreshHealthScore}
              className="text-sm text-primary-600 hover:text-primary-700 mt-2 block"
            >
              Refresh Score
            </button>
          </div>
        </div>

        {/* Journey Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Journey Progress</span>
            <span className="text-gray-600">{client.journeyProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${client.journeyProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Foundation</span>
            <span>Prep</span>
            <span>Launch</span>
            <span>Growth</span>
          </div>
          <p className="text-sm font-medium mt-2">
            Current Stage: <span className="text-primary-600">{client.journeyStage}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Files</p>
              <p className="text-2xl font-bold">{stats?.files || 0}</p>
            </div>
            <DocumentIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emails</p>
              <p className="text-2xl font-bold">{stats?.emails || 0}</p>
            </div>
            <EnvelopeIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Milestones</p>
              <p className="text-2xl font-bold">
                {stats?.milestones?.completed || 0}/{stats?.milestones?.total || 0}
              </p>
            </div>
            <FlagIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Days as Client</p>
              <p className="text-2xl font-bold">{stats?.daysAsClient || 0}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'milestones', 'files', 'emails', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status:</dt>
                  <dd className="font-medium">{client.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Project Status:</dt>
                  <dd className="font-medium">{client.projectStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Contract Status:</dt>
                  <dd className="font-medium">{client.contractStatus}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Onboarded:</dt>
                  <dd className="font-medium">
                    {new Date(client.onboardedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Health Score Breakdown</h3>
              {client.healthFactors && (
                <div className="space-y-3">
                  {Object.entries({
                    email: 'Email Activity',
                    milestone: 'Milestone Progress',
                    activity: 'General Activity',
                    progress: 'Project Progress',
                  }).map(([key, label]) => {
                    const score = client.healthFactors[key]?.score || 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span className="font-medium">{score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Milestones</h3>
            {client.milestones && client.milestones.length > 0 ? (
              <div className="space-y-3">
                {client.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FlagIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-gray-500">{milestone.category}</p>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        milestone.status === 'Completed'
                          ? 'badge-green'
                          : milestone.status === 'In Progress'
                          ? 'badge-blue'
                          : 'badge-yellow'
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No milestones yet</p>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Files & Documents</h3>
            {client.files && client.files.length > 0 ? (
              <div className="space-y-2">
                {client.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">{file.originalName}</p>
                        <p className="text-sm text-gray-500">
                          {file.category} • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {file.isAiGenerated && (
                      <span className="badge badge-blue">AI Generated</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No files yet</p>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Emails</h3>
            {client.emails && client.emails.length > 0 ? (
              <div className="space-y-3">
                {client.emails.map((email) => (
                  <div key={email.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{email.subject || '(No Subject)'}</p>
                        <p className="text-sm text-gray-500">
                          {email.direction === 'Incoming' ? 'From' : 'To'}: {email.from}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(email.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{email.snippet}</p>
                    {email.sentimentLabel && (
                      <span
                        className={`badge mt-2 ${
                          email.sentimentLabel === 'Positive'
                            ? 'badge-green'
                            : email.sentimentLabel === 'Negative'
                            ? 'badge-red'
                            : 'badge-yellow'
                        }`}
                      >
                        {email.sentimentLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No emails synced yet</p>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
            {client.activityLogs && client.activityLogs.length > 0 ? (
              <div className="space-y-4">
                {client.activityLogs.map((activity) => (
                  <div key={activity.id} className="flex">
                    <div className="flex-shrink-0 w-2 bg-primary-600 rounded-full mr-4" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No activity yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage;
