import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  plan_type: 'team' | 'business' | 'enterprise';
  max_members: number;
  current_members: number;
  settings: {
    require_approval: boolean;
    allow_public_signup: boolean;
    default_role: 'member' | 'admin';
    branding_enabled: boolean;
    sso_enabled: boolean;
    api_access_enabled: boolean;
  };
  billing_email: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  organization_id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended' | 'removed';
  permissions: string[];
  joined_at: string;
  last_active?: string;
  invitation_token?: string;
  invitation_expires_at?: string;
}

export interface TeamInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: TeamMember['role'];
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

const ROLE_PERMISSIONS = {
  owner: ['*'], // All permissions
  admin: [
    'manage_members',
    'manage_billing',
    'manage_settings',
    'view_analytics',
    'create_projects',
    'manage_projects',
    'use_api'
  ],
  manager: [
    'view_analytics',
    'create_projects',
    'manage_projects',
    'invite_members'
  ],
  member: [
    'create_projects',
    'view_own_projects'
  ],
  viewer: [
    'view_projects'
  ]
};

/**
 * Create a new organization
 */
export async function createOrganization(
  name: string,
  slug: string,
  ownerId: string,
  planType: Organization['plan_type'] = 'team'
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if slug is available
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingOrg) {
      return { success: false, error: 'Organization slug already exists' };
    }

    // Create organization
    const maxMembers = planType === 'team' ? 10 : planType === 'business' ? 50 : 500;
    
    const organization: Omit<Organization, 'id' | 'created_at' | 'updated_at'> = {
      name,
      slug,
      plan_type: planType,
      max_members: maxMembers,
      current_members: 1,
      settings: {
        require_approval: false,
        allow_public_signup: false,
        default_role: 'member',
        branding_enabled: planType !== 'team',
        sso_enabled: planType === 'enterprise',
        api_access_enabled: planType !== 'team'
      },
      billing_email: '' // Will be set later
    };

    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single();

    if (orgError) throw orgError;

    // Add owner as first member
    const ownerMember: Omit<TeamMember, 'id'> = {
      organization_id: newOrg.id,
      user_id: ownerId,
      email: '', // Will be filled from user profile
      role: 'owner',
      status: 'active',
      permissions: ROLE_PERMISSIONS.owner,
      joined_at: new Date().toISOString()
    };

    const { error: memberError } = await supabase
      .from('team_members')
      .insert(ownerMember);

    if (memberError) throw memberError;

    logger.info('Organization created', 'TEAM_MANAGEMENT', {
      organizationId: newOrg.id,
      name,
      slug,
      ownerId
    });

    return { success: true, organizationId: newOrg.id };

  } catch (error) {
    logger.error('Error creating organization', error as Error, 'TEAM_MANAGEMENT', { name, slug, ownerId });
    return { success: false, error: 'Failed to create organization' };
  }
}

/**
 * Invite a user to join an organization
 */
export async function inviteTeamMember(
  organizationId: string,
  email: string,
  role: TeamMember['role'],
  invitedBy: string
): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if user has permission to invite
    const canInvite = await checkPermission(organizationId, invitedBy, 'invite_members');
    if (!canInvite) {
      return { success: false, error: 'Insufficient permissions to invite members' };
    }

    // Check organization member limit
    const { data: org } = await supabase
      .from('organizations')
      .select('max_members, current_members')
      .eq('id', organizationId)
      .single();

    if (org && org.current_members >= org.max_members) {
      return { success: false, error: 'Organization has reached member limit' };
    }

    // Check if user is already a member or invited
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email.toLowerCase())
      .single();

    if (existingMember) {
      return { success: false, error: 'User is already a member of this organization' };
    }

    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email.toLowerCase())
      .is('accepted_at', null)
      .single();

    if (existingInvitation) {
      return { success: false, error: 'User has already been invited' };
    }

    // Create invitation
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const invitation: Omit<TeamInvitation, 'id' | 'created_at'> = {
      organization_id: organizationId,
      email: email.toLowerCase(),
      role,
      invited_by: invitedBy,
      token,
      expires_at: expiresAt
    };

    const { data: newInvitation, error: invitationError } = await supabase
      .from('team_invitations')
      .insert(invitation)
      .select()
      .single();

    if (invitationError) throw invitationError;

    // Send invitation email (implement based on your email system)
    await sendInvitationEmail(email, token, organizationId);

    logger.info('Team member invited', 'TEAM_MANAGEMENT', {
      organizationId,
      email,
      role,
      invitedBy
    });

    return { success: true, invitationId: newInvitation.id };

  } catch (error) {
    logger.error('Error inviting team member', error as Error, 'TEAM_MANAGEMENT', {
      organizationId,
      email,
      role,
      invitedBy
    });
    return { success: false, error: 'Failed to invite team member' };
  }
}

/**
 * Accept team invitation
 */
export async function acceptTeamInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (invitationError || !invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'Invitation has expired' };
    }

    // Add user to organization
    const member: Omit<TeamMember, 'id'> = {
      organization_id: invitation.organization_id,
      user_id: userId,
      email: invitation.email,
      role: invitation.role,
      status: 'active',
      permissions: ROLE_PERMISSIONS[invitation.role],
      joined_at: new Date().toISOString()
    };

    const { error: memberError } = await supabase
      .from('team_members')
      .insert(member);

    if (memberError) throw memberError;

    // Mark invitation as accepted
    await supabase
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Update organization member count
    await supabase.rpc('increment_org_members', {
      org_id: invitation.organization_id
    });

    logger.info('Team invitation accepted', 'TEAM_MANAGEMENT', {
      organizationId: invitation.organization_id,
      userId,
      email: invitation.email
    });

    return { success: true, organizationId: invitation.organization_id };

  } catch (error) {
    logger.error('Error accepting team invitation', error as Error, 'TEAM_MANAGEMENT', { token, userId });
    return { success: false, error: 'Failed to accept invitation' };
  }
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  organizationId: string,
  memberId: string,
  newRole: TeamMember['role'],
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check permissions
    const canManage = await checkPermission(organizationId, updatedBy, 'manage_members');
    if (!canManage) {
      return { success: false, error: 'Insufficient permissions to manage members' };
    }

    // Update member role and permissions
    const { error } = await supabase
      .from('team_members')
      .update({
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole]
      })
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (error) throw error;

    logger.info('Team member role updated', 'TEAM_MANAGEMENT', {
      organizationId,
      memberId,
      newRole,
      updatedBy
    });

    return { success: true };

  } catch (error) {
    logger.error('Error updating team member role', error as Error, 'TEAM_MANAGEMENT', {
      organizationId,
      memberId,
      newRole,
      updatedBy
    });
    return { success: false, error: 'Failed to update member role' };
  }
}

/**
 * Remove team member
 */
export async function removeTeamMember(
  organizationId: string,
  memberId: string,
  removedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check permissions
    const canManage = await checkPermission(organizationId, removedBy, 'manage_members');
    if (!canManage) {
      return { success: false, error: 'Insufficient permissions to remove members' };
    }

    // Remove member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (error) throw error;

    // Update organization member count
    await supabase.rpc('decrement_org_members', {
      org_id: organizationId
    });

    logger.info('Team member removed', 'TEAM_MANAGEMENT', {
      organizationId,
      memberId,
      removedBy
    });

    return { success: true };

  } catch (error) {
    logger.error('Error removing team member', error as Error, 'TEAM_MANAGEMENT', {
      organizationId,
      memberId,
      removedBy
    });
    return { success: false, error: 'Failed to remove team member' };
  }
}

/**
 * Check if user has specific permission
 */
export async function checkPermission(
  organizationId: string,
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data: member } = await supabase
      .from('team_members')
      .select('permissions, role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!member) return false;

    // Owner has all permissions
    if (member.role === 'owner') return true;

    // Check if user has specific permission or wildcard
    return member.permissions.includes(permission) || member.permissions.includes('*');

  } catch (error) {
    logger.error('Error checking permission', error as Error, 'TEAM_MANAGEMENT', {
      organizationId,
      userId,
      permission
    });
    return false;
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string): Promise<TeamMember[]> {
  try {
    const supabase = await createClient();
    
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    return members || [];

  } catch (error) {
    logger.error('Error getting organization members', error as Error, 'TEAM_MANAGEMENT', { organizationId });
    return [];
  }
}

/**
 * Helper functions
 */
function generateInvitationToken(): string {
  return Math.random().toString(36).substr(2, 32);
}

async function sendInvitationEmail(email: string, token: string, organizationId: string): Promise<void> {
  // Implement email sending logic
  // This would integrate with your email system
  logger.info('Invitation email sent', 'TEAM_MANAGEMENT', { email, organizationId });
}

/**
 * Database schema for team management (run in Supabase SQL editor)
 */
export const createTeamManagementTables = `
-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('team', 'business', 'enterprise')),
  max_members INTEGER NOT NULL,
  current_members INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  billing_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
  permissions TEXT[] DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  invitation_token TEXT,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(organization_id, user_id)
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can view team members in their organizations" ON team_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Functions for member count management
CREATE OR REPLACE FUNCTION increment_org_members(org_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE organizations SET current_members = current_members + 1 WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_org_members(org_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE organizations SET current_members = GREATEST(current_members - 1, 0) WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
