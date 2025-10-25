import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Month names and focus areas
const MONTH_INFO = {
  1: { name: 'Month 1 - Foundation Excellence', focus: 'Establishing core brand fundamentals' },
  2: { name: 'Month 2 - Brand Readiness & Productization', focus: 'Developing product line and infrastructure' },
  3: { name: 'Month 3 - Market Entry Preparation', focus: 'Building launch campaign and growth infrastructure' },
  4: { name: 'Month 4 - Sales Engine & Launch Infrastructure', focus: 'Optimizing conversion and customer experience' },
  5: { name: 'Month 5 - Pre-Launch Mastery', focus: 'Final preparation and soft launch simulation' },
  6: { name: 'Month 6 - Soft Launch Execution', focus: 'Soft launch to limited audience and iteration' },
  7: { name: 'Month 7 - Scaling & Growth Systems', focus: 'Scaling successful systems and expanding reach' },
  8: { name: 'Month 8 - Full Launch & Market Domination', focus: 'Full market launch and long-term growth strategy' },
};

// Document templates for each month
const MONTH_DOCUMENTS = {
  1: [
    'Brand Architecture Strategy',
    'Market Fortification Strategy',
    'Visual Identity Strategy',
    'Content Framework Strategy',
    'Community Foundation Strategy',
  ],
  2: [
    'Product Development Playbook',
    'E-Commerce Infrastructure Blueprint',
    'Visual Assets Production Guide',
    'Content Production SOP',
    'Operational Readiness Playbook',
  ],
  3: [
    'Pre-Launch Campaign Strategy',
    'Influencer & Affiliate Growth Playbook',
    'Advertising Starter Kit',
    'Content Engine Execution Kit',
    'Community Building Playbook',
  ],
  4: [
    'Conversion Optimization Framework',
    'Email & CRM Automation Kit',
    'Customer Experience Playbook',
    'Analytics & Performance Dashboard',
    'Scaling Partnerships Kit',
  ],
  5: [
    'Pre-Launch Simulation Report',
    'Crisis & Reputation Management Kit',
    'Launch Event & Activation Playbook',
    'Team & Creator Roles Matrix',
    'Final Go-to-Market Plan',
  ],
  6: [
    'Soft Launch Campaign Report',
    'Content & Ad Optimization Framework',
    'Customer Feedback Loop System',
    'Creator Performance Dashboard',
    'Iteration & Improvement Roadmap',
  ],
  7: [
    'Paid Media Scaling Playbook',
    'Community Monetization Expansion Plan',
    'Influencer/Affiliate Scaling Kit',
    'Product Expansion Framework',
    'Team & Ops Scaling SOPs',
  ],
  8: [
    'Full Launch Master Plan',
    'Omnichannel Growth Strategy',
    'Strategic Partnerships & Distribution Kit',
    'Brand Authority Building Guide',
    'Long-Term Scaling Roadmap',
  ],
};

/**
 * Month Accordion Component
 *
 * Collapsible section showing all documents for a specific month
 * with their statuses and actions.
 */
const MonthAccordion = ({
  monthNumber,
  monthData,
  monthProgress,
  currentMonth,
  completedMonths,
  onGenerateMonth,
  onViewDocument,
  generating,
  clientId,
}) => {
  const [isOpen, setIsOpen] = useState(monthNumber === currentMonth);

  const monthInfo = MONTH_INFO[monthNumber];
  const templateDocuments = MONTH_DOCUMENTS[monthNumber];
  const isLocked = monthProgress.status === 'locked';
  const isCompleted = completedMonths.includes(monthNumber);
  const isCurrent = monthNumber === currentMonth;
  const hasGenerated = monthData.generated;

  // Get status for each document
  const documentStatuses = templateDocuments.map((docName, index) => {
    const doc = monthData.documents?.find((d) => d.name === docName);
    return {
      name: docName,
      docNumber: index + 1,
      status: doc?.status || 'not-generated',
      doc: doc || null,
    };
  });

  const allApproved = documentStatuses.every((d) => d.status === 'approved');
  const anyGenerated = documentStatuses.some((d) => d.status !== 'not-generated');

  // Status icon and color
  const getStatusIcon = () => {
    if (isLocked) return <LockClosedIcon className="h-6 w-6 text-gray-400" />;
    if (isCompleted) return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    if (isCurrent) return <ClockIcon className="h-6 w-6 text-primary-500" />;
    return <ClockIcon className="h-6 w-6 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (isLocked) return 'border-gray-300 bg-gray-50';
    if (isCompleted) return 'border-green-300 bg-green-50';
    if (isCurrent) return 'border-primary-300 bg-primary-50';
    return 'border-gray-300 bg-white';
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden transition-all ${getStatusColor()}`}>
      {/* Header */}
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        disabled={isLocked}
        className="w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-colors disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div className="text-left">
            <h3 className="font-bold text-lg">{monthInfo.name}</h3>
            <p className="text-sm text-gray-600">{monthInfo.focus}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Badge */}
          {isLocked && (
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
              Locked
            </span>
          )}
          {isCompleted && (
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
              Completed ✓
            </span>
          )}
          {isCurrent && !isCompleted && (
            <span className="px-3 py-1 bg-primary-200 text-primary-800 rounded-full text-sm font-medium">
              Current Month
            </span>
          )}

          {/* Progress */}
          {!isLocked && (
            <span className="text-sm text-gray-600">
              {documentStatuses.filter((d) => d.status === 'approved').length}/{templateDocuments.length} Approved
            </span>
          )}

          {/* Chevron */}
          {!isLocked &&
            (isOpen ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            ))}
        </div>
      </button>

      {/* Content */}
      {isOpen && !isLocked && (
        <div className="border-t border-gray-200 p-4 bg-white">
          {/* Generate Button (if not generated yet) */}
          {!hasGenerated && (
            <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Ready to generate Month {monthNumber} documents?</p>
                    <p className="text-sm text-gray-600">
                      This will create all 5 consulting-grade documents tailored to this creator.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onGenerateMonth(monthNumber)}
                  disabled={generating}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {generating ? 'Generating...' : 'Generate All Documents'}
                </button>
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="space-y-3">
            {documentStatuses.map((docStatus) => (
              <DocumentCard
                key={docStatus.docNumber}
                monthNumber={monthNumber}
                docNumber={docStatus.docNumber}
                documentName={docStatus.name}
                status={docStatus.status}
                document={docStatus.doc}
                onView={() => onViewDocument(monthNumber, docStatus.docNumber, docStatus.name)}
              />
            ))}
          </div>

          {/* Completion Message */}
          {allApproved && !isCompleted && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                All documents approved! Month {monthNumber} is complete.
                {monthNumber < 8 && ' Month ' + (monthNumber + 1) + ' is now unlocked.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthAccordion;
