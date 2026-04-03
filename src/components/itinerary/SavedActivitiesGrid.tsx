import Image from "next/image";
import { Activity } from "@/store/tripStore";

export function SavedActivitiesGrid({ activities }: { activities: Activity[] }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">Saved Activities</div>
      <div className="grid grid-cols-2 gap-2">
        {activities.map((i) => (
          <div key={i.id} className="relative h-24 overflow-hidden rounded-lg bg-slate-100">
            {i.photoUrl || i.imageUrl ? (
              <Image src={i.photoUrl ?? i.imageUrl!} alt={i.name} fill className="object-cover" />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">
              {i.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
