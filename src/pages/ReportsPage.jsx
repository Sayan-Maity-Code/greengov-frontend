import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import {
    generateReport,
    getReportsByScope,
    getReportById,
    getAnalytics,
    getReportsSummary,
} from "../api/reportsApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
 
// Color palette for pie charts
const COLORS = ["#198754", "#28a745", "#20c997", "#17a2b8", "#ffc107", "#fd7e14"];
 
// Scope-specific data keys
const SCOPE_KEYS = {
    PROJECT: ["totalProjects", "activeProjects", "completedProjects"],
    COMPLIANCE: ["totalAudits", "compliantCount", "nonCompliantCount"],
    INCENTIVE: ["totalIncentives", "approvedIncentives", "totalSanctionedAmount", "totalDisbursedAmount"],
    PROGRAM: ["totalPrograms", "activePrograms", "totalBudget", "remainingBudget"],
};
 
export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("analytics");
    const [analytics, setAnalytics] = useState(null);
    const [summary, setSummary] = useState(null);
    const [scopeReports, setScopeReports] = useState([]);
    const [reportById, setReportById] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
 
    // Generate report state
    const [generateScope, setGenerateScope] = useState("PROJECT");
    // Fetch by scope state
    const [scopeType, setScopeType] = useState("PROJECT");
    // Fetch by ID state
    const [fetchId, setFetchId] = useState("");
 
    useEffect(() => {
        if (activeTab === "analytics") loadAnalytics();
        else if (activeTab === "summary") loadSummary();
    }, [activeTab]);
 
    const clearMessages = () => { setError(""); setSuccess(""); };
 
    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await getAnalytics();
            setAnalytics(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load analytics");
        } finally { setLoading(false); }
    };
 
    const loadSummary = async () => {
        try {
            setLoading(true);
            const data = await getReportsSummary();
            setSummary(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load summary");
        } finally { setLoading(false); }
    };
 
    const handleGenerateReport = async () => {
        clearMessages();
        try {
            setLoading(true);
            const data = await generateReport(generateScope);
            setSuccess(`Report of scope "${generateScope}" generated successfully!`);
            setScopeReports(prev => [data, ...prev]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate report");
        } finally { setLoading(false); }
    };
 
    const handleFetchByScope = async () => {
        clearMessages();
        try {
            setLoading(true);
            const data = await getReportsByScope(scopeType);
            setScopeReports(Array.isArray(data) ? data : [data]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch reports by scope");
        } finally { setLoading(false); }
    };
 
    const handleFetchById = async () => {
        if (!fetchId) { setError("Please enter a Report ID"); return; }
        clearMessages();
        try {
            setLoading(true);
            const data = await getReportById(fetchId);
            setReportById(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch report");
        } finally { setLoading(false); }
    };
 
    // Filter and format data for pie charts based on scope
    const getFilteredAnalytics = (data, scope) => {
        if (!data) return {};
        const keys = SCOPE_KEYS[scope] || [];
        return Object.keys(data)
            .filter(key => keys.includes(key))
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});
    };
 
    // Convert analytics object to array for pie chart
    const analyticsToChartData = (analytics) => {
        return Object.entries(analytics).map(([label, value]) => ({
            name: label.replace(/_/g, " "),
            value: typeof value === "number" ? value : 0,
        }));
    };
 
    return (
        <div>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h4 className="fw-bold text-success mb-0">📊 Reports & Analytics</h4>
                    <p className="text-muted small mb-0">Generate reports and view analytics by scope</p>
                </div>
            </div>
 
            {error   && <Alert message={error}   type="danger" />}
            {success && <Alert message={success} type="success" />}
 
            {/* Tabs Navigation */}
            <ul className="nav nav-tabs mb-4">
                {[
                    { key: "analytics", label: "📈 Analytics Overview" },
                    { key: "generate",  label: "➕ Generate Report" },
                    { key: "scope",     label: "🔍 By Scope" },
                    
                ].map(tab => (
                    <li className="nav-item" key={tab.key}>
                        <button
                            className={`nav-link ${activeTab === tab.key ? "active fw-semibold" : "text-muted"}`}
                            onClick={() => { setActiveTab(tab.key); clearMessages(); }}
                            style={activeTab === tab.key ? { color: '#198754', borderBottomColor: '#198754' } : {}}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
 
            {loading && <Loading />}
 
            {/* ============== ANALYTICS OVERVIEW TAB ============== */}
            {!loading && activeTab === "analytics" && (
                <div>
                    {analytics ? (
                        <div className="row g-4">
                            {/* Program Analytics */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">🎯 Program Analytics</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center g-3">
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Total Programs</p>
                                                <h4 className="fw-bold text-success">{analytics.totalPrograms || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Active</p>
                                                <h4 className="fw-bold text-success">{analytics.activePrograms || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Total Budget</p>
                                                <h4 className="fw-bold text-success">${analytics.totalBudget || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Utilization</p>
                                                <h4 className="fw-bold text-success">{analytics.utilizationPercent || 0}%</h4>
                                            </div>
                                        </div>
                                        {analytics.totalPrograms > 0 && (
                                            <ResponsiveContainer width="100%" height={200} className="mt-3">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: "Active", value: analytics.activePrograms || 0 },
                                                            { name: "Inactive", value: (analytics.totalPrograms || 0) - (analytics.activePrograms || 0) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill={COLORS[0]} />
                                                        <Cell fill={COLORS[4]} />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
 
                            {/* Incentive Analytics */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">💰 Incentive Analytics</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center g-3">
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Total Incentives</p>
                                                <h4 className="fw-bold text-success">{analytics.totalIncentives || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Approved</p>
                                                <h4 className="fw-bold text-success">{analytics.approvedIncentives || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Approval Rate</p>
                                                <h4 className="fw-bold text-success">{analytics.approvalRate || 0}%</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Avg Disbursement</p>
                                                <h4 className="fw-bold text-success">${analytics.avgDisbursement || 0}</h4>
                                            </div>
                                        </div>
                                        {analytics.totalIncentives > 0 && (
                                            <ResponsiveContainer width="100%" height={200} className="mt-3">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: "Approved", value: analytics.approvedIncentives || 0 },
                                                            { name: "Pending", value: (analytics.totalIncentives || 0) - (analytics.approvedIncentives || 0) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill={COLORS[1]} />
                                                        <Cell fill={COLORS[5]} />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
 
                            {/* Project Analytics */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">📦 Project Analytics</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center g-3">
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Total Projects</p>
                                                <h4 className="fw-bold text-success">{analytics.totalProjects || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Active</p>
                                                <h4 className="fw-bold text-success">{analytics.activeProjects || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Completed</p>
                                                <h4 className="fw-bold text-success">{analytics.completedProjects || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Completion Rate</p>
                                                <h4 className="fw-bold text-success">{analytics.projectCompletionRate || 0}%</h4>
                                            </div>
                                        </div>
                                        {analytics.totalProjects > 0 && (
                                            <ResponsiveContainer width="100%" height={200} className="mt-3">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: "Active", value: analytics.activeProjects || 0 },
                                                            { name: "Completed", value: analytics.completedProjects || 0 },
                                                            { name: "Other", value: (analytics.totalProjects || 0) - (analytics.activeProjects || 0) - (analytics.completedProjects || 0) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill={COLORS[2]} />
                                                        <Cell fill={COLORS[3]} />
                                                        <Cell fill={COLORS[4]} />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
 
                            {/* Compliance Analytics */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">✅ Compliance Analytics</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center g-3">
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Total Audits</p>
                                                <h4 className="fw-bold text-success">{analytics.totalAudits || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Compliant</p>
                                                <h4 className="fw-bold text-success">{analytics.compliantCount || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Non-Compliant</p>
                                                <h4 className="fw-bold text-danger">{analytics.nonCompliantCount || 0}</h4>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-muted small mb-1">Compliance Rate</p>
                                                <h4 className="fw-bold text-success">{analytics.complianceRate || 0}%</h4>
                                            </div>
                                        </div>
                                        {analytics.totalAudits > 0 && (
                                            <ResponsiveContainer width="100%" height={200} className="mt-3">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: "Compliant", value: analytics.compliantCount || 0 },
                                                            { name: "Non-Compliant", value: analytics.nonCompliantCount || 0 }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill={COLORS[0]} />
                                                        <Cell fill="#dc3545" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="display-6 mb-3">📊</div>
                                <p className="text-muted mb-3">No analytics data available</p>
                                <button className="btn btn-success" onClick={loadAnalytics}>
                                    Reload Analytics
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
 
            {/* ============== GENERATE REPORT TAB ============== */}
            {!loading && activeTab === "generate" && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Generate New Report by Scope</h5>
                    </div>
                    <div className="card-body">
                        <div className="row align-items-end g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Select Scope</label>
                                <select
                                    className="form-select"
                                    value={generateScope}
                                    onChange={e => setGenerateScope(e.target.value)}
                                >
                                    <option value="PROJECT">📦 Project</option>
                                    <option value="COMPLIANCE">✅ Compliance</option>
                                    <option value="INCENTIVE">💰 Incentive</option>
                                    <option value="PROGRAM">🎯 Program</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <button
                                    className="btn btn-success w-100"
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                >
                                    {loading ? "Generating..." : "Generate Report"}
                                </button>
                            </div>
                        </div>
 
                        {scopeReports.length > 0 && (
                            <div className="mt-4">
                                <h6 className="fw-semibold mb-3">Generated Reports</h6>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-success">
                                            <tr>
                                                <th>ID</th>
                                                <th>Scope</th>
                                                <th>Created Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scopeReports.map((r, idx) => (
                                                <tr key={r.id || idx}>
                                                    <td className="fw-semibold">{r.id || "—"}</td>
                                                    <td><span className="badge bg-success">{r.scope || generateScope}</span></td>
                                                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Now"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
 
            {/* ============== REPORTS BY SCOPE TAB ============== */}
            {!loading && activeTab === "scope" && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Reports by Scope</h5>
                    </div>
                    <div className="card-body">
                        <div className="row align-items-end g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Select Scope</label>
                                <select
                                    className="form-select"
                                    value={scopeType}
                                    onChange={e => setScopeType(e.target.value)}
                                >
                                    <option value="PROJECT">📦 Project</option>
                                    <option value="COMPLIANCE">✅ Compliance</option>
                                    <option value="INCENTIVE">💰 Incentive</option>
                                    <option value="PROGRAM">🎯 Program</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <button className="btn btn-success w-100" onClick={handleFetchByScope} disabled={loading}>
                                    Fetch Reports
                                </button>
                            </div>
                        </div>
 
                        {scopeReports.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-success">
                                        <tr><th>ID</th><th>Scope</th><th>Created Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {scopeReports.map((r, idx) => (
                                            <tr key={r.id || idx}>
                                                <td className="fw-semibold">{r.id}</td>
                                                <td><span className="badge bg-success">{r.scope || scopeType}</span></td>
                                                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted text-center mt-3">📭 Select a scope and click Fetch Reports</p>
                        )}
                    </div>
                </div>
            )}
 
            {/* ============== FETCH BY ID TAB ============== */}
            {!loading && activeTab === "byId" && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Fetch Report by ID</h5>
                    </div>
                    <div className="card-body">
                        <div className="row align-items-end g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Report ID</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter report ID"
                                    value={fetchId}
                                    onChange={e => setFetchId(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <button className="btn btn-success w-100" onClick={handleFetchById} disabled={loading}>
                                    Fetch
                                </button>
                            </div>
                        </div>
 
                        {reportById && (
                            <div className="card bg-light border-0">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">📄 Report Details</h6>
                                    <div className="row">
                                        {Object.entries(reportById)
                                            .filter(([k, v]) => v !== null && v !== undefined && v !== "")
                                            .map(([k, v]) => (
                                                <div className="col-md-6 mb-2" key={k}>
                                                    <span className="text-muted text-capitalize">{k.replace(/_/g, " ")}: </span>
                                                    <strong className="text-success">{String(v)}</strong>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
 
            {/* ============== SUMMARY TAB ============== */}
            {!loading && activeTab === "summary" && (
                <div>
                    {summary ? (
                        <div className="row g-4">
                            {Object.entries(summary).map(([scope, data]) => {
                                const filteredData = getFilteredAnalytics(data, scope);
                                const chartData = analyticsToChartData(filteredData);
                                return (
                                    <div className="col-lg-6" key={scope}>
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-header bg-success text-white">
                                                <h6 className="mb-0">
                                                    {scope === "PROJECT" && "📦"}
                                                    {scope === "COMPLIANCE" && "✅"}
                                                    {scope === "INCENTIVE" && "💰"}
                                                    {scope === "PROGRAM" && "🎯"}
                                                    {" "}{scope} Summary
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row text-center mb-3">
                                                    {Object.entries(filteredData).map(([key, value]) => (
                                                        <div className="col-md-6 mb-2" key={key}>
                                                            <p className="text-muted small mb-1">{key.replace(/_/g, " ")}</p>
                                                            <h5 className="fw-bold text-success">{String(value)}</h5>
                                                        </div>
                                                    ))}
                                                </div>
                                                {chartData.length > 0 && (
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={40}
                                                                outerRadius={70}
                                                                dataKey="value"
                                                            >
                                                                {chartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="display-6 mb-3">📋</div>
                                <p className="text-muted mb-3">No summary data available</p>
                                <button className="btn btn-success" onClick={loadSummary}>Load Summary</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
 
 