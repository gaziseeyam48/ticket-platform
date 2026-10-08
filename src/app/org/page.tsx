import { createServerDbClient } from "@/lib/db/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Users, Activity } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard - Ticket Platform",
  description: "Organization dashboard",
};

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createServerDbClient();
  
  // We don't need to check user existence because layout does it, but we can fetch some stats
  await supabase.auth.getUser();

  // Get active events count (placeholder for now until Phase 3)
  const activeEventsCount = 0;
  const totalRegistrations = 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Welcome back. Here&apos;s an overview of your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeEventsCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Activity</CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">--</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mt-12">
        <h2 className="text-xl font-bold text-zinc-100">Recent Events</h2>
        <Link href="/org/events/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <Card className="bg-zinc-900/20 border-zinc-800 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-200">No events found</h3>
          <p className="text-zinc-500 max-w-sm mt-2 mb-6">
            You don&apos;t have any events yet. Create your first event to start accepting registrations.
          </p>
          <Link href="/org/events/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
