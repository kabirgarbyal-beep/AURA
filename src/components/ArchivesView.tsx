import React, { useEffect, useState } from 'react';
import { Compass, Trash2, Download, Search, RefreshCw, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

interface Dossier {
  id: string;
  name: string;
  email: string;
  message: string;
  bureau: string;
  timestamp: string;
}

export default function ArchivesView() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureauFilter, setSelectedBureauFilter] = useState<'ALL' | 'MILAN' | 'NEW YORK' | 'TOKYO'>('ALL');
  const [focusedDossier, setFocusedDossier] = useState<Dossier | null>(null);
  const [revealSecrets, setRevealSecrets] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [systemLog, setSystemLog] = useState<string[]>([
    'SYSTEM BOOT: ARCHIVAL DOSSIER TERMINAL ONLINE',
    'SECURITY SHIELDS: AES-256 ACTIVE',
    'COORDINATION DIRECTORY: ESTABLISHED'
  ]);

  // Fetch all dossiers on mount
  const fetchDossiers = async () => {
    setLoading(true);
    addLog('QUERYING DATABASE ARCHIVES...');
    try {
      const response = await fetch('/api/dossiers');
      const data = await response.json();
      if (data.success) {
        setDossiers(data.dossiers);
        addLog(`SYNC COMPLETE: ${data.dossiers.length} SECURE RECORDS RETRIEVED.`);
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown response structure');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to establish database link.');
      addLog('LINK CRITICAL: CONNECTION RESET BY SEED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();

    // GSAP staggered entrance for archives panel elements
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      gsap.fromTo('.archive-anim-item',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    } else {
      gsap.set('.archive-anim-item', { opacity: 1, y: 0 });
    }
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLog(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
  };

  const toggleSecret = (id: string) => {
    setRevealSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Delete/Purge dossier handler
  const handlePurgeDossier = async (id: string) => {
    addLog(`INITIALIZING DESTRUCT CODES FOR ID: ${id.toUpperCase()}`);
    try {
      const response = await fetch(`/api/dossiers/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setDossiers(prev => prev.filter(item => item.id !== id));
        if (focusedDossier?.id === id) setFocusedDossier(null);
        addLog(`PURGE SUCCESSFUL. CELL INDEX FREED.`);
        setDeleteTarget(null);
      } else {
        throw new Error(data.error || 'Purge failed');
      }
    } catch (err) {
      addLog('PURGE FAILURE: INSUFFICIENT ACCESS LEVEL');
      alert('Could not delete file from archives.');
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (dossiers.length === 0) {
      addLog('EXPORT HALTED: ARCHIVE COLLECTION EMPTY');
      return;
    }
    addLog('COMPILING SPREADSHEET MANIFEST [CSV]...');
    const headers = ['Dossier ID', 'Client Name', 'Secure Email', 'Bureau Office', 'Raw Dossier Content', 'Timestamp'];
    const rows = dossiers.map(d => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.email.replace(/"/g, '""')}"`,
      d.bureau,
      `"${d.message.replace(/"/g, '""')}"`,
      d.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aura_Atelier_Dossiers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('MANIFEST EXPORTED SUCCESSFULLY.');
  };

  // Filter & Search Logic
  const filteredDossiers = dossiers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBureau = 
      selectedBureauFilter === 'ALL' || 
      d.bureau.toUpperCase() === selectedBureauFilter;

    return matchesSearch && matchesBureau;
  });

  return (
    <div className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative min-h-screen">
      {/* Decorative architectural grid lines */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#c5a880_1px,transparent_1px),linear-gradient(to_bottom,#c5a880_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Cinematic Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/5 archive-anim-item">
          <div>
            <span className="font-mono text-[9px] text-gold-text tracking-[0.4em] uppercase block mb-3">
              DATA COLLECTION & ARCHIVES
            </span>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight uppercase font-light leading-none">
              Dossier <span className="text-gold-text">Terminal</span>
            </h1>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDossiers}
              className="px-4 py-2 border border-white/10 hover:border-gold-text text-gold-text font-mono text-[9px] tracking-widest uppercase transition-all duration-300 rounded-none bg-white/5 flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-text' : ''}`} />
              <span>REFRESH</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={dossiers.length === 0}
              className="px-4 py-2 border border-gold-text/30 hover:border-gold-text disabled:opacity-40 disabled:hover:border-gold-text/30 text-gold-text font-mono text-[9px] tracking-widest uppercase transition-all duration-300 rounded-none bg-gold-text/5 flex items-center space-x-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT SPREADSHEET</span>
            </button>
          </div>
        </div>

        {/* Live Network & Telemetry Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 archive-anim-item">
          
          {/* Active Terminal Security Status */}
          <div className="col-span-1 md:col-span-4 bg-luxury-gray/10 border border-white/5 p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
              <Compass className="w-4 h-4 text-gold-text animate-pulse" />
              <span className="font-mono text-[9px] text-gold-text uppercase tracking-widest">Atelier Server Link</span>
            </div>
            
            <div className="space-y-2 font-mono text-[10px] text-gold-muted">
              <div className="flex justify-between">
                <span>SYSTEM STATUS:</span>
                <span className="text-emerald-500 font-bold">// SECURE_ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>TOTAL DOSSIERS:</span>
                <span className="text-f7f5f0 font-semibold">{dossiers.length} Records</span>
              </div>
              <div className="flex justify-between">
                <span>LOCAL CACHE:</span>
                <span className="text-f7f5f0 font-semibold">Active</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT SECURE ID:</span>
                <span className="text-gold-text font-semibold">BUREAU_MASTER_8</span>
              </div>
            </div>

            {/* Live streaming hexadecimal terminal logs */}
            <div className="pt-4 border-t border-white/5 space-y-1">
              <span className="font-mono text-[8px] text-gold-muted/50 uppercase tracking-widest block mb-2">Live Console Logs:</span>
              <div className="bg-black/40 border border-white/5 p-3 font-mono text-[8px] text-gold-muted/80 h-24 overflow-hidden flex flex-col justify-end space-y-1 rounded-none leading-tight">
                {systemLog.map((log, index) => (
                  <div key={index} className="truncate">&gt; {log}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Search, Filter, & Main Database Table */}
          <div className="col-span-1 md:col-span-8 flex flex-col space-y-6">
            
            {/* Search and Filters Layout */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold-muted" />
                <input
                  type="text"
                  placeholder="SEARCH CLIENT NAME, EMAIL, OR DOSSIER ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 font-mono text-[10px] tracking-widest uppercase text-f7f5f0 placeholder:text-gold-muted/50 focus:outline-none focus:border-gold-text transition-colors duration-300 rounded-none"
                />
              </div>

              {/* Bureau Filters */}
              <div className="flex space-x-1 border border-white/10 p-[3px] bg-luxury-gray/5">
                {(['ALL', 'MILAN', 'NEW YORK', 'TOKYO'] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBureauFilter(b)}
                    className={`px-3 py-1.5 font-mono text-[8px] tracking-widest uppercase transition-all rounded-none ${
                      selectedBureauFilter === b 
                        ? 'bg-gold-text text-luxury-black font-semibold' 
                        : 'text-gold-muted hover:text-f7f5f0 hover:bg-white/5'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Dossier Table */}
            <div className="border border-white/5 bg-luxury-gray/5 min-h-[350px] overflow-x-auto relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-luxury-black/80">
                  <RefreshCw className="w-6 h-6 text-gold-text animate-spin" />
                  <span className="font-mono text-[9px] text-gold-muted tracking-widest uppercase">Querying Central Bureau Archive...</span>
                </div>
              ) : filteredDossiers.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                  <ShieldAlert className="w-8 h-8 text-gold-muted/50" />
                  <div className="space-y-1">
                    <p className="font-serif text-lg text-f7f5f0 uppercase font-light">No Secure Dossiers Logged</p>
                    <p className="font-mono text-[9px] text-gold-muted max-w-sm mx-auto uppercase tracking-wide leading-relaxed">
                      Either no clients have transmitted blueprints, or your current filter criteria yields empty database cells.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gold-text uppercase tracking-widest bg-white/5">
                      <th className="py-3 px-4 font-semibold text-[8px]">ID</th>
                      <th className="py-3 px-4 font-semibold text-[8px]">Client / Identity</th>
                      <th className="py-3 px-4 font-semibold text-[8px]">Bureau Target</th>
                      <th className="py-3 px-4 font-semibold text-[8px]">Secure Email</th>
                      <th className="py-3 px-4 font-semibold text-[8px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDossiers.map((d) => (
                      <tr 
                        key={d.id} 
                        className={`hover:bg-white/5 transition-colors duration-300 ${focusedDossier?.id === d.id ? 'bg-gold-text/5' : ''}`}
                      >
                        <td className="py-4 px-4 font-semibold text-gold-text/80 text-[9px]">{d.id.split('_').slice(0,2).join('_').toUpperCase()}</td>
                        <td className="py-4 px-4 font-medium text-f7f5f0 text-[11px] font-sans uppercase tracking-wide">{d.name}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 border border-gold-text/20 bg-gold-text/5 text-gold-text text-[8px] uppercase tracking-wider font-semibold">
                            {d.bureau}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gold-muted tracking-normal">
                          {revealSecrets[d.id] ? (
                            <span className="text-f7f5f0 font-mono text-[9px]">{d.email}</span>
                          ) : (
                            <span>••••••••@••••.•••</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right space-x-1.5 flex justify-end">
                          <button
                            onClick={() => toggleSecret(d.id)}
                            title={revealSecrets[d.id] ? "Mask Identity" : "Reveal Identity"}
                            className="p-1.5 border border-white/5 hover:border-gold-text text-gold-muted hover:text-gold-text transition-colors rounded-none"
                          >
                            {revealSecrets[d.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setFocusedDossier(focusedDossier?.id === d.id ? null : d)}
                            className="p-1.5 border border-white/5 hover:border-gold-text text-gold-muted hover:text-f7f5f0 font-mono text-[8px] tracking-widest uppercase transition-colors rounded-none"
                          >
                            {focusedDossier?.id === d.id ? '[ HIDE ]' : '[ INSPECT ]'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(d.id)}
                            className="p-1.5 border border-white/5 hover:border-red-500 text-gold-muted hover:text-red-500 transition-colors rounded-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Dossier Inspection Console */}
        {focusedDossier && (
          <div className="bg-luxury-gray/15 border border-gold-text/20 p-6 md:p-8 space-y-6 relative overflow-hidden transition-all duration-500 archive-anim-item">
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold-text to-transparent" />
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="font-mono text-[8px] text-gold-text tracking-[0.3em] uppercase block mb-1">
                  DECRYPTED SECURE DOSSIER // READOUT
                </span>
                <h3 className="font-serif text-2xl text-f7f5f0 uppercase font-light tracking-wide">
                  {focusedDossier.name}
                </h3>
              </div>
              <div className="text-right font-mono text-[9px] text-gold-muted">
                <div>SPEC_CELL_ID: {focusedDossier.id.toUpperCase()}</div>
                <div>SECURE_STAMP: {new Date(focusedDossier.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px] text-gold-muted">
              <div className="space-y-1.5">
                <span className="text-gold-text/60 font-semibold block text-[8px] tracking-widest uppercase">Client Metadata:</span>
                <p><strong className="text-f7f5f0">Bureau Target:</strong> {focusedDossier.bureau.toUpperCase()} OFFICE</p>
                <p><strong className="text-f7f5f0">Assigned ID:</strong> {focusedDossier.id}</p>
                <p><strong className="text-f7f5f0">Decrypted Email:</strong> {focusedDossier.email}</p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <span className="text-gold-text/60 font-semibold block text-[8px] tracking-widest uppercase">Transmitted Message & Blueprint Coordinates:</span>
                <div className="bg-black/50 border border-white/5 p-4 text-f7f5f0 font-sans text-xs md:text-sm tracking-wide leading-relaxed font-light whitespace-pre-wrap min-h-[80px]">
                  {focusedDossier.message}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setFocusedDossier(null)}
                className="px-5 py-2 border border-white/10 hover:border-gold-text text-gold-text font-mono text-[9px] tracking-widest uppercase transition-colors rounded-none"
              >
                [ CLOSE CONSOLE ]
              </button>
            </div>
          </div>
        )}

        {/* Purge Confirmation Overlay */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[20000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-luxury-dark border border-red-500/30 p-8 rounded-none text-center space-y-6 shadow-2xl">
              <div className="w-12 h-12 border border-red-500/20 bg-red-500/5 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-xl text-f7f5f0 uppercase tracking-wide">Confirm Purge Sequence</h4>
                <p className="font-mono text-[9px] text-gold-muted uppercase tracking-wide leading-relaxed">
                  You are about to permanently purge secure record <span className="text-red-400">{deleteTarget.toUpperCase()}</span> from the master bureau directory. This action is irreversible.
                </p>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-6 py-2.5 border border-white/10 hover:border-white text-f7f5f0 font-mono text-[9px] tracking-widest uppercase transition-colors rounded-none"
                >
                  ABORT SEQUENCE
                </button>
                <button
                  onClick={() => handlePurgeDossier(deleteTarget)}
                  className="px-6 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-200 border border-red-500 hover:border-red-600 font-mono text-[9px] tracking-widest uppercase transition-colors rounded-none"
                >
                  CONFIRM PURGE
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
