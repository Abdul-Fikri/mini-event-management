import { getTodayJakartaDate } from "@/lib/dates";

export const EVENT_STATUS_OPTIONS = [
  ["draft", "Draf"],
  ["planned", "Direncanakan"],
  ["planning", "Perencanaan"],
  ["preparation", "Persiapan"],
  ["ongoing", "Berlangsung"],
  ["evaluation", "Evaluasi"],
  ["completed", "Selesai"],
  ["cancelled", "Dibatalkan"],
];

export const EVENT_STATUS_LABELS = Object.fromEntries(EVENT_STATUS_OPTIONS);

export function getEffectiveEventStatus(event, today = getTodayJakartaDate()) {
  if (event?.status_mode !== "automatic") {
    return event?.status || "draft";
  }

  if (!event?.start_date) {
    return event?.status || "planned";
  }

  const eventEndDate = event.end_date || event.start_date;
  const planningStartDate = event.planning_start_date || null;
  const preparationStartDate = event.preparation_start_date || null;
  const evaluationEndDate = event.evaluation_end_date || null;

  if (today < event.start_date) {
    if (
      planningStartDate &&
      preparationStartDate &&
      today >= preparationStartDate
    ) {
      return "preparation";
    }

    if (planningStartDate && today >= planningStartDate) {
      return "planning";
    }

    return "planned";
  }

  if (today <= eventEndDate) {
    return "ongoing";
  }

  if (evaluationEndDate && today <= evaluationEndDate) {
    return "evaluation";
  }

  return "completed";
}

export function getEventStatusLabel(event, today) {
  const status = getEffectiveEventStatus(event, today);
  return EVENT_STATUS_LABELS[status] || EVENT_STATUS_LABELS.draft;
}
