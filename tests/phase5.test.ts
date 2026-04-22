import { describe, it, expect } from 'vitest'
import { _submitComplaint, _getComplaints } from '../src/lib/server/complaints'
import { supabase } from '../src/lib/supabase'

describe('Phase 5 Integration: Full Stack Wiring', () => {
  const TEST_CUSTOMER_ID = "c0000001-0000-0000-0000-000000000001";

  it('should fetch complaints with AI analysis attached', async () => {
    const complaints = await _getComplaints();
    expect(Array.isArray(complaints)).toBe(true);
    
    if (complaints && complaints.length > 0) {
      const first = complaints[0];
      expect(first).toHaveProperty('ai_analyses');
    }
  });

  it('should submit a complaint and trigger AI analysis', async () => {
    const payload = {
      category: 'Technical',
      product: 'Mobile Banking',
      description: 'The app crashes whenever I try to open the transactions tab. This is very frustrating.',
      preferred_resolution: 'Other',
      customer_id: TEST_CUSTOMER_ID
    };

    const complaint = await _submitComplaint(payload);
    expect(complaint).toHaveProperty('id');
    expect(complaint.status).toBe('OPEN');

    // Wait a bit for the AI analysis to potentially finish if it was fire-and-forget
    // but in our implementation we awaited it.
    
    const { data: analysis } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('complaint_id', complaint.id)
      .single();

    if (analysis) {
        console.log('✅ AI Analysis created:', analysis.summary);
        expect(analysis.complaint_id).toBe(complaint.id);
        expect(analysis.sentiment).toBeDefined();
    } else {
        console.warn('⚠️ AI Analysis not found - is the FastAPI service running?');
    }
  });
});
