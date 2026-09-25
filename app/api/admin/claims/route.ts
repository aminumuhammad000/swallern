import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Claims API – admin only.
 * Supported actions (POST body):
 *   create_claim  – create a new claim for a topic
 *   update_claim  – edit claim_text / status / notes
 *   delete_claim  – remove a claim (and its claim_sources cascade)
 *   link_source   – attach a source to a claim
 *   unlink_source – remove a source from a claim
 *   get_research  – return full research view for a topic (claims + sources + citation coverage)
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, topic_id, claim_id, source_id, claim_text, status, notes } = body;
    const supabase = createAdminClient();

    // ── Create claim ─────────────────────────────────────────────────────────
    if (action === 'create_claim') {
      if (!topic_id || !claim_text?.trim()) {
        return NextResponse.json({ error: 'topic_id and claim_text are required' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('claims')
        .insert({
          topic_id,
          claim_text: claim_text.trim(),
          status: status || 'UNVERIFIED',
          notes: notes?.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ claim: data });
    }

    // ── Update claim ─────────────────────────────────────────────────────────
    if (action === 'update_claim') {
      if (!claim_id) return NextResponse.json({ error: 'claim_id required' }, { status: 400 });
      const updates: Record<string, unknown> = {};
      if (claim_text !== undefined) updates.claim_text = claim_text.trim();
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes?.trim() || null;
      const { data, error } = await supabase
        .from('claims')
        .update(updates)
        .eq('id', claim_id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ claim: data });
    }

    // ── Delete claim ─────────────────────────────────────────────────────────
    if (action === 'delete_claim') {
      if (!claim_id) return NextResponse.json({ error: 'claim_id required' }, { status: 400 });
      const { error } = await supabase.from('claims').delete().eq('id', claim_id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ── Link source to claim ─────────────────────────────────────────────────
    if (action === 'link_source') {
      if (!claim_id || !source_id) {
        return NextResponse.json({ error: 'claim_id and source_id required' }, { status: 400 });
      }
      const { error } = await supabase.from('claim_sources').upsert({ claim_id, source_id });
      if (error) throw error;
      // NOTE: Status is NOT automatically changed. Admins must explicitly set
      // status to SUPPORTED after reviewing the linked evidence.
      return NextResponse.json({ success: true });
    }

    // ── Unlink source from claim ─────────────────────────────────────────────
    if (action === 'unlink_source') {
      if (!claim_id || !source_id) {
        return NextResponse.json({ error: 'claim_id and source_id required' }, { status: 400 });
      }
      const { error } = await supabase
        .from('claim_sources')
        .delete()
        .eq('claim_id', claim_id)
        .eq('source_id', source_id);
      if (error) throw error;
      // NOTE: Status is NOT automatically changed on unlink. Admins review and
      // update claim status explicitly via update_claim action.
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Claims operation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/claims?topic_id=xxx
 * Returns all claims for a topic with their linked sources + citation coverage.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const topic_id = searchParams.get('topic_id');
  if (!topic_id) {
    return NextResponse.json({ error: 'topic_id query parameter required' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    // Fetch claims
    const { data: claims, error: claimsErr } = await supabase
      .from('claims')
      .select('*')
      .eq('topic_id', topic_id)
      .order('created_at', { ascending: true });

    if (claimsErr) throw claimsErr;

    // Fetch claim_sources with source details
    const claimIds = (claims || []).map((c) => c.id);
    let claimSourceMap: Record<string, unknown[]> = {};
    if (claimIds.length > 0) {
      const { data: csRows } = await supabase
        .from('claim_sources')
        .select('claim_id, source_id')
        .in('claim_id', claimIds);
      const srcIds = [...new Set((csRows || []).map((r) => r.source_id))];
      let sourceDetails: Record<string, unknown> = {};
      if (srcIds.length > 0) {
        const { data: srcs } = await supabase.from('sources').select('*').in('id', srcIds);
        (srcs || []).forEach((s) => { sourceDetails[s.id] = s; });
      }
      (csRows || []).forEach((r) => {
        if (!claimSourceMap[r.claim_id]) claimSourceMap[r.claim_id] = [];
        if (sourceDetails[r.source_id]) claimSourceMap[r.claim_id].push(sourceDetails[r.source_id]);
      });
    }

    // Build full claims with sources
    const claimsWithSources = (claims || []).map((c) => ({
      ...c,
      sources: claimSourceMap[c.id] || [],
    }));

    // Citation coverage stats
    const total = claimsWithSources.length;
    const supported = claimsWithSources.filter((c) => c.status === 'SUPPORTED').length;
    const unverified = claimsWithSources.filter((c) => c.status === 'UNVERIFIED').length;
    const disputed = claimsWithSources.filter((c) => c.status === 'DISPUTED').length;
    const rejected = claimsWithSources.filter((c) => c.status === 'REJECTED').length;
    const coveragePct = total > 0 ? Math.round((supported / total) * 100) : 0;

    return NextResponse.json({
      claims: claimsWithSources,
      coverage: { total, supported, unverified, disputed, rejected, coveragePct },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load research data' },
      { status: 500 }
    );
  }
}
