'use client';

import { notFound } from 'next/navigation';
import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllReviewableComponentIds } from '@/lib/component-approval/component-ids';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ComponentReviewQueuePage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [filterType, setFilterType] = useState<'all' | 'example' | 'activity' | 'practice'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unreviewed' | 'approved' | 'changes_requested' | 'rejected' | 'stale'>('all');
  const [includeStale, setIncludeStale] = useState(true);

  const allComponents = getAllReviewableComponentIds();
  const approvals = useQuery(api.componentApprovals.getReviewQueue, {
    includeStale,
    componentType: filterType === 'all' ? undefined : filterType,
  });

  const approvalMap = new Map(
    approvals?.map((a) => [`${a.componentType}:${a.componentId}`, a]) || []
  );

  const enrichedComponents = allComponents.map((component) => {
    const key = `${component.componentType}:${component.componentId}`;
    const approval = approvalMap.get(key);
    const effectiveStatus = approval
      ? (approval as Record<string, unknown>).effectiveStatus as string || approval.approvalStatus
      : 'unreviewed';
    const currentHash = approval
      ? (approval as Record<string, unknown>).currentVersionHash as string || ''
      : '';
    return {
      ...component,
      effectiveStatus,
      approval,
      currentHash,
    };
  });

  const filteredComponents = enrichedComponents.filter((c) => {
    if (filterType !== 'all' && c.componentType !== filterType) return false;
    if (filterStatus !== 'all' && c.effectiveStatus !== filterStatus) return false;
    return true;
  });

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'changes_requested':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stale':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="space-y-2 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Developer only</p>
          <h1 className="text-3xl font-semibold tracking-tight">Component Review Queue</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Review examples, activities, and practice families for quality and correctness.
          </p>
        </header>

        <section className="rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Type:</span>
              {(['all', 'example', 'activity', 'practice'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Status:</span>
              {(['all', 'unreviewed', 'approved', 'changes_requested', 'rejected', 'stale'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Include stale:</span>
              <Button
                variant={includeStale ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeStale(!includeStale)}
              >
                {includeStale ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {filteredComponents.map((component) => (
            <Card key={`${component.componentType}:${component.componentId}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{component.componentType}</Badge>
                    <Badge className={statusBadgeClass(component.effectiveStatus)}>
                      {component.effectiveStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{component.componentId}</CardTitle>
                  <CardDescription>
                    Current hash: {component.currentHash.slice(0, 8)}...
                    {component.approval && (
                      <>
                        {' • '}Approved hash: {component.approval.approvalVersionHash.slice(0, 8)}...
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Harness</Button>
                  <Button size="sm">Review</Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
