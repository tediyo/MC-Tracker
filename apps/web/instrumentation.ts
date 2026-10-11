export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initAlertsCronWatcher } = await import("@/lib/alerts/auto-cron-runner");
    initAlertsCronWatcher();
  }
}
