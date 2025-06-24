import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export interface DataProcessingRecord {
  id: string;
  user_id: string;
  data_type: 'personal_info' | 'biometric_data' | 'usage_data' | 'communication_data' | 'financial_data';
  processing_purpose: 'service_provision' | 'analytics' | 'marketing' | 'legal_compliance' | 'security';
  legal_basis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  data_categories: string[];
  retention_period: number; // in days
  third_party_sharing: boolean;
  third_parties?: string[];
  created_at: string;
  expires_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'data_processing' | 'marketing' | 'analytics' | 'cookies' | 'third_party_sharing';
  granted: boolean;
  consent_text: string;
  version: string;
  ip_address: string;
  user_agent: string;
  granted_at?: string;
  withdrawn_at?: string;
  expires_at?: string;
}

export interface DataExportRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  request_type: 'full_export' | 'specific_data' | 'portability';
  data_categories?: string[];
  export_format: 'json' | 'csv' | 'pdf';
  download_url?: string;
  expires_at?: string;
  requested_at: string;
  completed_at?: string;
}

export interface DataDeletionRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  deletion_type: 'full_account' | 'specific_data' | 'anonymization';
  data_categories?: string[];
  reason?: string;
  rejection_reason?: string;
  requested_at: string;
  completed_at?: string;
  verified_at?: string;
}

/**
 * Record data processing activity
 */
export async function recordDataProcessing(
  userId: string,
  dataType: DataProcessingRecord['data_type'],
  purpose: DataProcessingRecord['processing_purpose'],
  legalBasis: DataProcessingRecord['legal_basis'],
  dataCategories: string[],
  retentionDays: number,
  thirdPartySharing: boolean = false,
  thirdParties?: string[]
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString();
    
    const record: Omit<DataProcessingRecord, 'id' | 'created_at'> = {
      user_id: userId,
      data_type: dataType,
      processing_purpose: purpose,
      legal_basis: legalBasis,
      data_categories: dataCategories,
      retention_period: retentionDays,
      third_party_sharing: thirdPartySharing,
      third_parties: thirdParties,
      expires_at: expiresAt
    };

    const { data: newRecord, error } = await supabase
      .from('data_processing_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;

    logger.info('Data processing recorded', 'DATA_PRIVACY', {
      userId,
      dataType,
      purpose,
      legalBasis
    });

    return { success: true, recordId: newRecord.id };

  } catch (error) {
    logger.error('Error recording data processing', error as Error, 'DATA_PRIVACY', { userId, dataType });
    return { success: false, error: 'Failed to record data processing' };
  }
}

/**
 * Record user consent
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentRecord['consent_type'],
  granted: boolean,
  consentText: string,
  version: string,
  ipAddress: string,
  userAgent: string,
  expiresAt?: string
): Promise<{ success: boolean; consentId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Withdraw previous consent if exists
    if (granted) {
      await supabase
        .from('consent_records')
        .update({ withdrawn_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .eq('granted', true)
        .is('withdrawn_at', null);
    }

    const consent: Omit<ConsentRecord, 'id'> = {
      user_id: userId,
      consent_type: consentType,
      granted,
      consent_text: consentText,
      version,
      ip_address: ipAddress,
      user_agent: userAgent,
      granted_at: granted ? new Date().toISOString() : undefined,
      withdrawn_at: !granted ? new Date().toISOString() : undefined,
      expires_at: expiresAt
    };

    const { data: newConsent, error } = await supabase
      .from('consent_records')
      .insert(consent)
      .select()
      .single();

    if (error) throw error;

    logger.info('Consent recorded', 'DATA_PRIVACY', {
      userId,
      consentType,
      granted,
      version
    });

    return { success: true, consentId: newConsent.id };

  } catch (error) {
    logger.error('Error recording consent', error as Error, 'DATA_PRIVACY', { userId, consentType });
    return { success: false, error: 'Failed to record consent' };
  }
}

/**
 * Create data export request
 */
export async function createDataExportRequest(
  userId: string,
  requestType: DataExportRequest['request_type'],
  exportFormat: DataExportRequest['export_format'],
  dataCategories?: string[]
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if user has pending export request
    const { data: pendingRequest } = await supabase
      .from('data_export_requests')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .single();

    if (pendingRequest) {
      return { success: false, error: 'You already have a pending export request' };
    }

    const request: Omit<DataExportRequest, 'id' | 'requested_at'> = {
      user_id: userId,
      status: 'pending',
      request_type: requestType,
      data_categories: dataCategories,
      export_format: exportFormat
    };

    const { data: newRequest, error } = await supabase
      .from('data_export_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    // Process export asynchronously
    processDataExport(newRequest.id);

    logger.info('Data export request created', 'DATA_PRIVACY', {
      userId,
      requestType,
      exportFormat,
      requestId: newRequest.id
    });

    return { success: true, requestId: newRequest.id };

  } catch (error) {
    logger.error('Error creating data export request', error as Error, 'DATA_PRIVACY', { userId });
    return { success: false, error: 'Failed to create export request' };
  }
}

/**
 * Create data deletion request
 */
export async function createDataDeletionRequest(
  userId: string,
  deletionType: DataDeletionRequest['deletion_type'],
  dataCategories?: string[],
  reason?: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if user has pending deletion request
    const { data: pendingRequest } = await supabase
      .from('data_deletion_requests')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .single();

    if (pendingRequest) {
      return { success: false, error: 'You already have a pending deletion request' };
    }

    const request: Omit<DataDeletionRequest, 'id' | 'requested_at'> = {
      user_id: userId,
      status: 'pending',
      deletion_type: deletionType,
      data_categories: dataCategories,
      reason
    };

    const { data: newRequest, error } = await supabase
      .from('data_deletion_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    logger.info('Data deletion request created', 'DATA_PRIVACY', {
      userId,
      deletionType,
      reason,
      requestId: newRequest.id
    });

    return { success: true, requestId: newRequest.id };

  } catch (error) {
    logger.error('Error creating data deletion request', error as Error, 'DATA_PRIVACY', { userId });
    return { success: false, error: 'Failed to create deletion request' };
  }
}

/**
 * Get user's privacy dashboard data
 */
export async function getUserPrivacyData(userId: string): Promise<{
  consents: ConsentRecord[];
  dataProcessing: DataProcessingRecord[];
  exportRequests: DataExportRequest[];
  deletionRequests: DataDeletionRequest[];
}> {
  try {
    const supabase = await createClient();
    
    const [consents, dataProcessing, exportRequests, deletionRequests] = await Promise.all([
      supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false }),
      
      supabase
        .from('data_processing_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false }),
      
      supabase
        .from('data_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
    ]);

    return {
      consents: consents.data || [],
      dataProcessing: dataProcessing.data || [],
      exportRequests: exportRequests.data || [],
      deletionRequests: deletionRequests.data || []
    };

  } catch (error) {
    logger.error('Error getting user privacy data', error as Error, 'DATA_PRIVACY', { userId });
    return {
      consents: [],
      dataProcessing: [],
      exportRequests: [],
      deletionRequests: []
    };
  }
}

/**
 * Process data export request
 */
async function processDataExport(requestId: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Update status to processing
    await supabase
      .from('data_export_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);

    // Get request details
    const { data: request } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) return;

    // Collect user data based on request type
    const userData = await collectUserData(request.user_id, request.data_categories);
    
    // Generate export file
    const exportData = formatExportData(userData, request.export_format);
    
    // Upload to secure storage (mock implementation)
    const downloadUrl = await uploadExportFile(exportData, request.export_format);
    
    // Set expiration (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Update request with download URL
    await supabase
      .from('data_export_requests')
      .update({
        status: 'completed',
        download_url: downloadUrl,
        expires_at: expiresAt,
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    logger.info('Data export completed', 'DATA_PRIVACY', { requestId });

  } catch (error) {
    const supabase = await createClient();
    await supabase
      .from('data_export_requests')
      .update({ status: 'failed' })
      .eq('id', requestId);

    logger.error('Error processing data export', error as Error, 'DATA_PRIVACY', { requestId });
  }
}

/**
 * Collect user data for export
 */
async function collectUserData(userId: string, dataCategories?: string[]): Promise<Record<string, any>> {
  const supabase = await createClient();
  const userData: Record<string, any> = {};

  // Collect user profile data
  if (!dataCategories || dataCategories.includes('profile')) {
    const { data: profile } = await supabase
      .from('userTable')
      .select('*')
      .eq('id', userId)
      .single();
    userData.profile = profile;
  }

  // Collect generated images
  if (!dataCategories || dataCategories.includes('images')) {
    const { data: images } = await supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('user_id', userId);
    userData.images = images;
  }

  // Collect consent records
  if (!dataCategories || dataCategories.includes('consents')) {
    const { data: consents } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId);
    userData.consents = consents;
  }

  // Collect analytics data
  if (!dataCategories || dataCategories.includes('analytics')) {
    const { data: analytics } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId);
    userData.analytics = analytics;
  }

  return userData;
}

/**
 * Format export data based on format
 */
function formatExportData(userData: Record<string, any>, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(userData, null, 2);
    
    case 'csv':
      // Convert to CSV format (simplified)
      let csv = '';
      for (const [category, data] of Object.entries(userData)) {
        csv += `\n\n=== ${category.toUpperCase()} ===\n`;
        if (Array.isArray(data)) {
          if (data.length > 0) {
            const headers = Object.keys(data[0]).join(',');
            csv += headers + '\n';
            data.forEach(item => {
              const values = Object.values(item).map(v => 
                typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
              ).join(',');
              csv += values + '\n';
            });
          }
        } else if (data) {
          const headers = Object.keys(data).join(',');
          const values = Object.values(data).join(',');
          csv += headers + '\n' + values + '\n';
        }
      }
      return csv;
    
    default:
      return JSON.stringify(userData, null, 2);
  }
}

/**
 * Upload export file to secure storage
 */
async function uploadExportFile(data: string, format: string): Promise<string> {
  // In production, upload to secure cloud storage with signed URLs
  // This is a mock implementation
  const filename = `data-export-${Date.now()}.${format}`;
  
  // Mock upload process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `https://secure-storage.cvphoto.app/exports/${filename}`;
}

/**
 * Database schema for data privacy (run in Supabase SQL editor)
 */
export const createDataPrivacyTables = `
-- Create data_processing_records table
CREATE TABLE IF NOT EXISTS data_processing_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('personal_info', 'biometric_data', 'usage_data', 'communication_data', 'financial_data')),
  processing_purpose TEXT NOT NULL CHECK (processing_purpose IN ('service_provision', 'analytics', 'marketing', 'legal_compliance', 'security')),
  legal_basis TEXT NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests')),
  data_categories TEXT[] DEFAULT '{}',
  retention_period INTEGER NOT NULL,
  third_party_sharing BOOLEAN DEFAULT false,
  third_parties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create consent_records table
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'marketing', 'analytics', 'cookies', 'third_party_sharing')),
  granted BOOLEAN NOT NULL,
  consent_text TEXT NOT NULL,
  version TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  request_type TEXT NOT NULL CHECK (request_type IN ('full_export', 'specific_data', 'portability')),
  data_categories TEXT[],
  export_format TEXT NOT NULL CHECK (export_format IN ('json', 'csv', 'pdf')),
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create data_deletion_requests table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  deletion_type TEXT NOT NULL CHECK (deletion_type IN ('full_account', 'specific_data', 'anonymization')),
  data_categories TEXT[],
  reason TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_data_processing_user_id ON data_processing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_data_processing_expires_at ON data_processing_records(expires_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_data_export_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_user_id ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_status ON data_deletion_requests(status);

-- Enable RLS
ALTER TABLE data_processing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data processing records" ON data_processing_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own consent records" ON consent_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own export requests" ON data_export_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own deletion requests" ON data_deletion_requests
  FOR ALL USING (auth.uid() = user_id);
`;
