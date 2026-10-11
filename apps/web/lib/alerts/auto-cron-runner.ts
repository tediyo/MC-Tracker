import { isLastDayOfMonth } from "date-fns";
import { isLastDayOfEthiopianMonth } from "@mc-tracker/shared-types";

function getAddisAbabaTime(): { hour: number; isEthiopianEnd: boolean; isGregorianEnd: boolean } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  const addisDate = new Date(get("year"), get("month") - 1, get("day"), get("hour"));

  return {
    hour: get("hour"),
    isEthiopianEnd: isLastDayOfEthiopianMonth(addisDate),
    isGregorianEnd: isLastDayOfMonth(addisDate),
  };
}

let cronInterval: NodeJS.Timeout | null = null;
let lastTriggeredDateString = "";

export function initAlertsCronWatcher() {
  if (cronInterval) return;

  const runCheck = async () => {
    try {
      const { hour, isEthiopianEnd, isGregorianEnd } = getAddisAbabaTime();

      // Check between 20:00 (8 PM) and 23:00 (11 PM) Addis Ababa local time
      if (hour < 20 || hour > 23) return;
      if (!isEthiopianEnd && !isGregorianEnd) return;

      const todayStr = new Date().toISOString().slice(0, 10);
      if (lastTriggeredDateString === todayStr) return; // Already triggered today

      const port = process.env.PORT || 3000;
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${port}`;

      console.log(`[Auto-Cron] Month-end detected (EthiopianEnd: ${isEthiopianEnd}, GregorianEnd: ${isGregorianEnd}). Dispatching reports...`);
      
      const res = await fetch(`${baseUrl}/api/alerts/dispatch-all-month-end-reports?onlyIfMonthEnd=true`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        lastTriggeredDateString = todayStr;
        console.log(`[Auto-Cron] Month-end report dispatch succeeded: ${data.sentCount} sent.`);
      }
    } catch (err: any) {
      console.warn("[Auto-Cron] Failed to run automated month-end check:", err.message);
    }
  };

  // Run initial check after 15 seconds of server startup
  setTimeout(runCheck, 15000);

  // Check every 30 minutes in the background
  cronInterval = setInterval(runCheck, 30 * 60 * 1000);
}
