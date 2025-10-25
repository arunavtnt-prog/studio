import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MonthAccordion from './MonthAccordion';
import DocumentViewer from './DocumentViewer';
import {
  AcademicCapIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Onboarding Program Dashboard
 *
 * Displays the 8-month onboarding program progress for a client.
 * Shows all months, documents, and their statuses.
 * Allows document generation and tracking.
 */
const OnboardingProgramDashboard = ({ clientId }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadProgress();
    }
  }, [clientId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/onboarding-kit/progress`);
      setProgress(response.data.data);
    } catch (err) {
      console.error('Error loading onboarding progress:', err);
      setError('Failed to load onboarding progress');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonth = async (monthNumber) => {
    try {
      setGenerating(true);
      setError(null);
      await axios.post(`${API_BASE_URL}/clients/${clientId}/onboarding-kit/month/${monthNumber}/generate`);
      await loadProgress();
      alert(`Month ${monthNumber} documents generated successfully!`);
    } catch (err) {
      console.error('Error generating month documents:', err);
      setError(err.response?.data?.error || 'Failed to generate documents');
      alert('Failed to generate documents. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewDocument = async (monthNumber, docNumber, documentName) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/clients/${clientId}/onboarding-kit/month/${monthNumber}/document/${docNumber}`
      );
      setSelectedDocument({
        ...response.data.data,
        monthNumber,
        docNumber,
      });
      setViewerOpen(true);
    } catch (err) {
      console.error('Error loading document:', err);
      alert('Failed to load document');
    }
  };

  const handleApproveDocument = async (monthNumber, docNumber) => {
    try {
      await axios.post(
        `${API_BASE_URL}/clients/${clientId}/onboarding-kit/month/${monthNumber}/document/${docNumber}/approve`
      );
      await loadProgress();
      setViewerOpen(false);
      alert('Document approved!');
    } catch (err) {
      console.error('Error approving document:', err);
      alert('Failed to approve document');
    }
  };

  const handleRequestRevision = async (monthNumber, docNumber, notes) => {
    try {
      await axios.post(
        `${API_BASE_URL}/clients/${clientId}/onboarding-kit/month/${monthNumber}/document/${docNumber}/revision`,
        { notes }
      );
      await loadProgress();
      setViewerOpen(false);
      alert('Revision requested');
    } catch (err) {
      console.error('Error requesting revision:', err);
      alert('Failed to request revision');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading onboarding program...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadProgress}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!progress) {
    return <div className="text-gray-500">No onboarding data available</div>;
  }

  const { currentMonth, completedMonths, monthProgress, stats } = progress;
  const months = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div>
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">8-Month Transformation Program</h2>
            <p className="text-primary-100">Month {currentMonth} of 8</p>
          </div>
          <AcademicCapIcon className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span>{stats.overallProgress}%</span>
          </div>
          <div className="w-full bg-primary-800 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{stats.approvedCount}</p>
            <p className="text-sm text-primary-100">Approved</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.generatedCount}</p>
            <p className="text-sm text-primary-100">Generated</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalDocuments}</p>
            <p className="text-sm text-primary-100">Total Documents</p>
          </div>
        </div>
      </div>

      {/* Month-by-Month Accordion */}
      <div className="space-y-4">
        {months.map((month) => {
          const monthKey = `month${month}`;
          const monthData = progress.onboardingKits[monthKey] || {
            generated: false,
            generatedAt: null,
            documents: [],
          };
          const monthProgressData = monthProgress[monthKey] || {
            status: month === 1 ? 'active' : 'locked',
          };

          return (
            <MonthAccordion
              key={month}
              monthNumber={month}
              monthData={monthData}
              monthProgress={monthProgressData}
              currentMonth={currentMonth}
              completedMonths={completedMonths}
              onGenerateMonth={handleGenerateMonth}
              onViewDocument={handleViewDocument}
              generating={generating}
              clientId={clientId}
            />
          );
        })}
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setViewerOpen(false)}
          onApprove={() => handleApproveDocument(selectedDocument.monthNumber, selectedDocument.docNumber)}
          onRequestRevision={(notes) =>
            handleRequestRevision(selectedDocument.monthNumber, selectedDocument.docNumber, notes)
          }
        />
      )}
    </div>
  );
};

export default OnboardingProgramDashboard;
