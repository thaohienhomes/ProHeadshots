"use client";

import React, { useState, useEffect } from 'react';

interface AffonsoDebuggerProps {
  showDetails?: boolean;
}

export default function AffonsoDebugger({ showDetails = false }: AffonsoDebuggerProps) {
  const [affonsoState, setAffonsoState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAffonso = () => {
      try {
        // Check if Affonso is available
        const hasAffonsoGlobal = typeof window !== 'undefined' && 'affonso' in window;
        const hasAffonsoReferralId = typeof window !== 'undefined' && 
          (new URLSearchParams(window.location.search).get('ref') || 
           document.cookie.includes('affonso_referral'));
        
        const affonsoReferralId = typeof window !== 'undefined' ? 
          new URLSearchParams(window.location.search).get('ref') || 
          document.cookie.match(/affonso_referral=([^;]+)/)?.[1] : null;

        setAffonsoState({
          isAvailable: hasAffonsoGlobal,
          hasReferralId: hasAffonsoReferralId,
          referralId: affonsoReferralId,
          globalVar: hasAffonsoGlobal ? '✅ Available' : '❌ Missing',
          cookie: document.cookie.includes('affonso_referral') ? '✅ Present' : '❌ Missing',
        });
      } catch (err) {
        console.error('Affonso debugger error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAffonso();
    
    // Check periodically for changes
    const interval = setInterval(checkAffonso, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!showDetails && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 p-3 bg-navy-800/90 border border-cyan-400/20 rounded-lg text-xs max-w-sm z-50">
      <div className="font-semibold text-cyan-400 mb-2">Affonso Debug</div>
      
      <div className="space-y-1 text-white">
        <div>Status: {affonsoState?.isAvailable ? '✅ Available' : '❌ Not loaded'}</div>
        <div>Referral ID: {affonsoState?.referralId || '❌ None'}</div>
        <div>Global Var: {affonsoState?.globalVar}</div>
        <div>Cookie: {affonsoState?.cookie}</div>
      </div>
      
      {showDetails && affonsoState && (
        <details className="mt-2">
          <summary className="cursor-pointer text-cyan-400">Raw Data</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(affonsoState, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
