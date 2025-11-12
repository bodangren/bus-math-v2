'use client';

import { useEffect, useState } from 'react';
import { getActivityComponent } from '@/lib/activities/registry';
import type { Activity } from '@/lib/db/schema/validators';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ActivityRendererProps {
  activityId: string;
  required?: boolean;
}

/**
 * ActivityRenderer fetches an activity from the database by ID
 * and renders it using the activity registry.
 */
export function ActivityRenderer({ activityId, required = false }: ActivityRendererProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setError(null);

        // Fetch activity from API
        const response = await fetch(`/api/activities/${activityId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.statusText}`);
        }

        const data = await response.json();
        setActivity(data);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [activityId]);

  if (loading) {
    return (
      <Card className="my-4">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !activity) {
    return (
      <Card className="my-4 border-red-200 bg-red-50">
        <CardContent className="py-4">
          <p className="text-red-700">
            Failed to load activity: {error || 'Activity not found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const ActivityComponent = getActivityComponent(activity.componentKey);

  if (!ActivityComponent) {
    return (
      <Card className="my-4 border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <p className="text-yellow-700">
            Activity component not found: {activity.componentKey}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{activity.displayName}</CardTitle>
          {required && (
            <Badge variant="destructive">Required</Badge>
          )}
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ActivityComponent {...activity.props} />
      </CardContent>
    </Card>
  );
}
