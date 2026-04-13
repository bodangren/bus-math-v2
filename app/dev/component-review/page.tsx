'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllReviewableComponentIds } from '@/lib/component-approval/component-ids';
import { computeComponentVersionHash } from '@/lib/component-approval/version-hashes';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-2xl rounded-lg border border-border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

const ISSUE_CATEGORIES = [
  'math_correctness',
  'pedagogy',
  'wording',
  'ui_bug',
  'accessibility',
  'algorithmic_variation',
  'missing_feedback',
  'too_easy',
  'too_hard',
  'completion_behavior',
  'evidence_quality',
] as const;

export default function ComponentReviewQueuePage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [filterType, setFilterType] = useState<'all' | 'example' | 'activity' | 'practice'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unreviewed' | 'approved' | 'changes_requested' | 'rejected' | 'stale'>('all');
  const [includeStale, setIncludeStale] = useState(true);

  const [reviewingComponent, setReviewingComponent] = useState<{
    componentType: 'example' | 'activity' | 'practice';
    componentId: string;
  } | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');
  const [reviewSummary, setReviewSummary] = useState('');
  const [improvementNotes, setImprovementNotes] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const allComponents = getAllReviewableComponentIds();
  const approvals = useQuery(api.componentApprovals.getReviewQueue, {
    includeStale,
    componentType: filterType === 'all' ? undefined : filterType,
  });
  const submitReview = useMutation(api.componentApprovals.submitComponentReview);

  const handleSubmitReview = async () => {
    if (!reviewingComponent) return;
    if (reviewingComponent.componentType === 'example') {
      throw new Error('Example components are not supported for review');
    }
    const componentVersionHash = computeComponentVersionHash(
      reviewingComponent.componentType,
      reviewingComponent.componentId
    );
    await submitReview({
      componentType: reviewingComponent.componentType,
      componentId: reviewingComponent.componentId,
      componentVersionHash,
      status: reviewStatus,
      reviewSummary: reviewSummary || undefined,
      improvementNotes: improvementNotes || undefined,
      issueCategories: Array.from(selectedCategories),
    });
    setReviewingComponent(null);
    setReviewStatus('approved');
    setReviewSummary('');
    setImprovementNotes('');
    setSelectedCategories(new Set());
  };

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
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dev/component-review/harness/${component.componentType}/${component.componentId}`}>
                      View Harness
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setReviewingComponent({
                        componentType: component.componentType,
                        componentId: component.componentId,
                      });
                      setReviewStatus('approved');
                      setReviewSummary('');
                      setImprovementNotes('');
                      setSelectedCategories(new Set());
                    }}
                  >
                    Review
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        {reviewingComponent && (
          <DialogShell
            title={`Review ${reviewingComponent.componentType}: ${reviewingComponent.componentId}`}
            onClose={() => setReviewingComponent(null)}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {(['approved', 'changes_requested', 'rejected'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={reviewStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReviewStatus(status)}
                    >
                      {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-summary">Review Summary (optional)</Label>
                <textarea
                  id="review-summary"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={reviewSummary}
                  onChange={(e) => setReviewSummary(e.target.value)}
                  placeholder="Brief summary of the review..."
                />
              </div>

              {(reviewStatus === 'changes_requested' || reviewStatus === 'rejected') && (
                <div className="space-y-2">
                  <Label htmlFor="improvement-notes">Improvement Notes (required)</Label>
                  <textarea
                    id="improvement-notes"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={improvementNotes}
                    onChange={(e) => setImprovementNotes(e.target.value)}
                    placeholder="Detailed notes on what needs to be improved..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Issue Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.has(category)}
                        onCheckedChange={(checked) => {
                          const newCategories = new Set(selectedCategories);
                          if (checked) {
                            newCategories.add(category);
                          } else {
                            newCategories.delete(category);
                          }
                          setSelectedCategories(newCategories);
                        }}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={
                    (reviewStatus === 'changes_requested' || reviewStatus === 'rejected') &&
                    !improvementNotes.trim()
                  }
                >
                  Submit Review
                </Button>
                <Button variant="outline" onClick={() => setReviewingComponent(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogShell>
        )}
      </div>
    </main>
  );
}
