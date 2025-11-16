// Service to handle terms acceptance records
import { supabase } from '@/lib/supabase';
import { TermsAgreement } from '@/types';

/**
 * Check if user has already accepted terms
 */
export async function hasUserAcceptedTerms(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error) {
    console.error('Error checking terms acceptance:', error);
    return false;
  }
}

/**
 * Record user's terms acceptance
 * Called after successful signup
 */
export async function recordTermsAcceptance(userId: string, ipAddress?: string): Promise<TermsAgreement | null> {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        version: '1.0',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording terms acceptance:', error);
    return null;
  }
}

/**
 * Get user's terms acceptance record
 */
export async function getUserTermsAcceptance(userId: string): Promise<TermsAgreement | null> {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching terms acceptance:', error);
    return null;
  }
}

export const termsService = {
  hasUserAcceptedTerms,
  recordTermsAcceptance,
  getUserTermsAcceptance,
};
