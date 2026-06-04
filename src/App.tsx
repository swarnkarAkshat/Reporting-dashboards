import React, { useState } from 'react';
import { FileText, Building2, Briefcase, Calendar, AlignLeft, Sparkles, LayoutDashboard, ShieldCheck, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportData {
  title: string;
  companyName: string;
  industry: string;
  timePeriod: string;
  content: string;
}

function App() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    reportType: 'Procurement Analysis',
    companyName: '',
    industry: 'Discrete Manufacturing',
    timePeriod: 'Last Month',
    additionalNotes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.ianman.com/webhook/reporting-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let data: Record<string, any> = {};

      try {
        const json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0) {
          data = json[0];
        } else if (json && typeof json === 'object') {
          data = json;
        }
      } catch (e) {
        // Not JSON, treat as raw text summary
        data = { executiveSummary: text };
      }

      let parsedTitle = data.title;
      let parsedContent = '';

      // Specifically handle the n8n JSON schema from the user's workflow
      if (data.report && typeof data.report === 'object') {
        parsedTitle = data.report.title || parsedTitle;
        const content = data.report.content || data.report.text || '';
        if (typeof content === 'string') {
          parsedContent = content;
        }
      }

      // Fallback if not inside report object
      if (!parsedContent) {
        parsedContent = data.executiveSummary || data.message || data.output || data.text || '';
      }

      // Ultimate fallback if nothing matches
      if (!parsedContent) {
        parsedContent = 'No detailed report content provided by the automation engine. Please check the raw webhook response.';
      }

      // Ensure all fields exist so the UI renders correctly
      const finalReportData: ReportData = {
        title: parsedTitle || `${formData.reportType} - AI Analysis`,
        companyName: data.companyName || formData.companyName || 'Unknown Client',
        industry: data.industry || formData.industry,
        timePeriod: data.timePeriod || formData.timePeriod,
        content: parsedContent
      };

      setReportData(finalReportData);
    } catch (error) {
      console.error("Failed to fetch report data from n8n webhook:", error);
      alert("Failed to generate report from webhook. Please check the browser console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans text-slate-900 bg-slate-50">

      {/* GLOBAL HEADER */}
      <header className="w-full h-16 bg-white border-b border-slate-200 px-6 flex justify-between items-center z-20 shrink-0">
        <img
          src="https://www.essnps.com/wp-content/uploads/2025/07/ESSNPS%C2%AE.svg"
          alt="ESSNPS Logo"
          className="h-10 w-auto object-contain"
        />
        <a
          href="mailto:rfq@essnps.com"
          className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          rfq@essnps.com
        </a>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT PANEL - REPORT INPUTS (30%) */}
        <div className="w-[30%] bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">Reporting Dashboard</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Report Type
              </label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              >
                <option value="Procurement Analysis">Procurement Analysis</option>
                <option value="Vendor Quality Report">Vendor Quality Report</option>
                <option value="Engineering Feasibility">Engineering Feasibility</option>
                <option value="Sourcing Strategy">Sourcing Strategy</option>
              </select>
            </div>

            {/* Client / Supplier Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                Client / Supplier Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Acme Manufacturing"
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder-slate-400"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              >
                <option value="Discrete Manufacturing">Discrete Manufacturing</option>
                <option value="Heavy Engineering">Heavy Engineering</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Process Industry">Process Industry</option>
              </select>
            </div>

            {/* Time Period */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Time Period
              </label>
              <select
                name="timePeriod"
                value={formData.timePeriod}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              >
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
                <option value="Last Quarter">Last Quarter</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-slate-400" />
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any specific focus areas or metrics to include..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder-slate-400 resize-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - GENERATED REPORT (70%) */}
        <div className="w-[70%] bg-slate-50 h-full flex flex-col relative overflow-hidden">

          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none -z-0"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-48 -left-24 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="px-10 pt-8 pb-4 flex justify-between items-end relative z-10 border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Generated Report</h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">Review insights and actionable recommendations below.</p>
            </div>
            {reportData && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                Report Ready
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">

            {!reportData ? (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                  <Sparkles className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No report generated yet.</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  Fill in the form and click Generate Report to create a report.
                </p>
              </div>
            ) : (
              // Report Content
              <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/75 p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{reportData.title}</h1>
                      <p className="text-slate-500 mt-2 text-lg font-medium">{reportData.companyName}</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 text-right">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Period</p>
                      <p className="text-sm font-semibold text-slate-700">{reportData.timePeriod}</p>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Industry</p>
                      <p className="text-sm font-semibold text-slate-800">{reportData.industry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Generated</p>
                      <p className="text-sm font-semibold text-slate-800">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Full Markdown Report Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/75 p-10">
                  <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 prose-p:leading-relaxed prose-li:marker:text-indigo-500">
                    <ReactMarkdown>{reportData.content}</ReactMarkdown>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global styles for custom scrollbar embedded directly for simplicity, though best in index.css */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}} />
    </div>
  );
}

export default App;
