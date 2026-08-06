import React, { useEffect, useMemo } from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.scss"
import { ClockView } from "./app/components/clock-view/ClockView"
import { EntrancePage } from "./app/components/entrance/EntrancePage"
import { PresentationView } from "./app/components/clock-view/presentation/PresentationView"
import { MessagesView } from "./app/components/clock-view/messages/MessagesView"
import { useDisplayRotation } from "./app/components/clock-view/presentation/useDisplayRotation"
import { resolveDebugView } from "./app/components/clock-view/presentation/resolveDebugView"
import { useRoute } from "./app/routing/useRoute"
import { TvClockView } from "./app/components/tv-view/TvClockView"
import { applyTheme, loadTheme } from "./app/shared/themes"
import { registerSW } from 'virtual:pwa-register'
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { getConfigSelector } from "./app/components/store/config/configSelectors"
import { loadConfig } from "./app/components/store/config/configSlice"
import { useConfigAutoRefresh } from "./app/hooks/useConfigAutoRefresh"
import { getPresentationsBlockedSelector, getMessagesBlockedSelector, getScheduleBlockedSelector } from "./app/components/store/settings/settingsSelectors"
import { getDebugViewOverride, getDebugRotationFrozen } from "./app/components/store/debug/debugSelectors"
import { ScheduleCalendar } from "./app/components/schedule-calendar/ScheduleCalendar"
import { resolveDaysAhead } from "./app/components/schedule-calendar/resolveDaysAhead"
import { useDeviceDaysAhead } from "./app/components/schedule-calendar/useDeviceDaysAhead"
import { DebugPanel } from "./app/components/debug/DebugPanel"

// Apply the persisted theme (family + dark/light) before the app renders.
const savedTheme = loadTheme();
applyTheme(savedTheme.familyId, savedTheme.mode);

// --- Service Worker Registration ---
// Poll the host every 30 minutes for a new build; apply immediately on detection.
const UPDATE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;
    setInterval(() => {
      registration.update();
    }, UPDATE_INTERVAL_MS);
  },
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[SW] App is ready for offline use.');
  },
});

/** True when the tenant config has at least one event in any day of weeklySchedule. */
function hasAnyWeeklyEvents(data: import('./app/components/store/config/configState').TenantConfig | null): boolean {
  if (!data?.weeklySchedule) return false;
  return Object.values(data.weeklySchedule).some((events) => events && events.length > 0);
}

/**
 * AppRoot — gates the app on tenant config state.
 *
 * Flow:
 * 1. If a tenantId is saved in localStorage and status is idle → dispatch loadConfig.
 * 2. While loading → show a splash/spinner.
 * 3. On ready → render ClockView with presentation rotation overlay.
 * 4. On idle (no saved ID) or error → render EntrancePage.
 */
function AppRoot() {
  const route = useRoute();
  const Dashboard = route === 'tv' ? TvClockView : ClockView;
  const dispatch = useAppDispatch();
  const { status, tenantId, data } = useAppSelector(getConfigSelector);
  const presentationsBlocked = useAppSelector(getPresentationsBlockedSelector);
  const messagesBlocked = useAppSelector(getMessagesBlockedSelector);
  const scheduleBlocked = useAppSelector(getScheduleBlockedSelector);
  const debugViewOverride = useAppSelector(getDebugViewOverride);
  const debugRotationFrozen = useAppSelector(getDebugRotationFrozen);
  const deviceDaysAhead = useDeviceDaysAhead(route);

  // Derive a config with blocked sections stripped so the rotation hook ignores them.
  const effectiveConfig = useMemo(() => {
    if (!data) return null;
    if (!presentationsBlocked && !messagesBlocked) return data;
    return {
      ...data,
      activePresentations: presentationsBlocked ? [] : data.activePresentations,
      ...(messagesBlocked ? { activeMessages: [] } : {}),
    };
  }, [data, presentationsBlocked, messagesBlocked]);

  // Schedule is a rotation view on tablet only, and only when not blocked.
  const includeSchedule = route !== 'tv' && !scheduleBlocked && hasAnyWeeklyEvents(data);
  const rotationView = useDisplayRotation(effectiveConfig, { includeSchedule, paused: debugRotationFrozen });

  // Debug override takes precedence over the rotation cycle.
  const view = resolveDebugView(debugViewOverride, data) ?? rotationView;

  // Poll config.json every 5 minutes so CMS changes (e.g. a deactivated
  // presentation) reach the display without a reload.
  useConfigAutoRefresh();

  useEffect(() => {
    if (tenantId && status === 'idle') {
      dispatch(loadConfig(tenantId));
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return (
      <div className="entrance-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary, #0b1020)' }}>
        <p style={{ color: '#aaa', fontSize: '1.3rem' }}>טוען נתוני בית הכנסת...</p>
      </div>
    );
  }

  if (status === 'ready') {
    // When rotating to a presentation, overlay it on top of the dashboard.
    // The rotation hook hands us the presentation object itself, so a config
    // refresh that shrinks the list can never produce an out-of-range lookup.
    if (view.kind === 'messages') {
      const messagesNode = (
        <MessagesView
          messages={view.messages}
          defaultSeconds={data?.displaySettings.presentationDurationSeconds ?? 20}
        />
      );

      return route === 'tv' ? (
        <TvClockView calendarOverride={messagesNode} />
      ) : (
        <ClockView
          bodyOverride={
            <section className="messages-body-section">{messagesNode}</section>
          }
        />
      );
    }
    if (view.kind === 'presentation') {
      return (
        <>
          <Dashboard />
          <PresentationView presentation={view.presentation} />
        </>
      );
    }
    if (view.kind === 'schedule' && route !== 'tv') {
      const daysAhead = resolveDaysAhead(data, route, deviceDaysAhead);
      return (
        <ClockView
          bodyOverride={
            <section className="schedule-body-section">
              <ScheduleCalendar daysAhead={daysAhead} title="לוח זמנים" />
            </section>
          }
        />
      );
    }
    return <Dashboard />;
  }

  // idle (no saved ID) or error
  return <EntrancePage />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppRoot />
    <DebugPanel />
  </Provider>
)
