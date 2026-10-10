import { EventLifecyclePanel } from "./event-lifecycle-panel";

interface EventStatusManagerProps {
  eventId: string;
  currentStatus: string;
}

export function EventStatusManager({ eventId, currentStatus }: EventStatusManagerProps) {
  return <EventLifecyclePanel eventId={eventId} currentStatus={currentStatus} />;
}
