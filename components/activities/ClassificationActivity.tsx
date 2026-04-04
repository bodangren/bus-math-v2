'use client';

import { useMemo, useState } from 'react';

import { CategorizationList, type CategorizationListZone, type CategorizationListItem } from '@/components/activities/shared/CategorizationList';
import type { z } from 'zod';
import type { activityPropsSchemas } from '@/lib/db/schema/activities-core';

type ClassificationActivityProps = z.infer<typeof activityPropsSchemas['classification']>;

interface ClassificationActivityComponentProps {
  activity: ClassificationActivityProps;
  onSubmit?: (data: { score: number; placements: Record<string, string[]> }) => void;
}

interface ClassificationItem extends CategorizationListItem {
  targetId: string;
  categoryId: string;
}

export function ClassificationActivity({ activity, onSubmit }: ClassificationActivityComponentProps) {
  const { title, description, categories, accounts } = activity;
  
  // Convert categories to zones format expected by CategorizationList
  const zones: CategorizationListZone[] = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.id,
      label: cat.name || cat.label || cat.id,
      description: cat.description,
      whyItMatters: cat.whyItMatters,
    }));
  }, [categories]);

  // Convert accounts to items format
  const items: ClassificationItem[] = useMemo(() => {
    if (accounts) {
      return accounts.map((account) => ({
        id: account.id,
        label: account.name,
        description: account.description,
        categoryId: account.categoryId,
        targetId: account.categoryId, // targetId maps to the zone/category id
        hint: account.hint,
        details: {},
      }));
    }
    // Fallback to empty array if no accounts provided
    return [];
  }, [accounts]);

  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = (payload: { score: number; attempts: number; placements: Record<string, CategorizationListItem[]> }) => {
    setIsComplete(true);
    
    // Convert placements to the format expected by onSubmit
    const simplifiedPlacements: Record<string, string[]> = {};
    for (const [zoneId, zoneItems] of Object.entries(payload.placements)) {
      simplifiedPlacements[zoneId] = zoneItems.map((item) => item.id);
    }
    
    onSubmit?.({
      score: payload.score,
      placements: simplifiedPlacements,
    });
  };

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No items to classify. Please check the activity configuration.</p>
      </div>
    );
  }

  return (
    <div className="classification-activity">
      <CategorizationList
        title={title}
        description={description}
        items={items}
        zones={zones}
        mode="guided_practice"
        showHintsByDefault={activity.scaffolding?.showHints ?? false}
        shuffleItems={true}
        onComplete={handleComplete}
      />
      {isComplete && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Activity completed!</p>
        </div>
      )}
    </div>
  );
}

export default ClassificationActivity;
