import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "../types/notifications";
import { ApiError } from "./apiError";
import {
  validateNotificationSettings,
  type SettingsSnapshot,
} from "./userSettingsService";

export type SettingsSyncState = {
  userId: number | null;
  settings: NotificationSettings;
  confirmed: SettingsSnapshot | null;
  ready: boolean;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  error: string | null;
  errorKind: "load" | "save" | "conflict" | null;
};
type IO = {
  read: (userId: number, signal: AbortSignal) => Promise<SettingsSnapshot>;
  write: (
    userId: number,
    snapshot: SettingsSnapshot,
    signal: AbortSignal,
  ) => Promise<SettingsSnapshot>;
};
type Scope = {
  userId: number;
  controller: AbortController;
  revision: number;
  busy: boolean;
  blocked: boolean;
  attempt?: { snapshot: SettingsSnapshot; revision: number };
};
export const copySettings = (
  s: NotificationSettings,
): NotificationSettings => ({ ...s, countries: [...s.countries] });
const equal = (a: NotificationSettings, b: NotificationSettings) =>
  JSON.stringify(a) === JSON.stringify(b);
const empty = (userId: number | null): SettingsSyncState => ({
  userId,
  settings: copySettings(DEFAULT_NOTIFICATION_SETTINGS),
  confirmed: null,
  ready: false,
  loading: userId !== null,
  saving: false,
  dirty: false,
  error: null,
  errorKind: null,
});

/** Una cola por sesión. Los tokens y la caché de otra cuenta nunca se reutilizan. */
export class UserSettingsSync {
  private state = empty(null);
  private scope: Scope | null = null;
  private listeners = new Set<() => void>();
  constructor(private io: IO) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(patch: Partial<SettingsSyncState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  private active(scope: Scope) {
    return this.scope === scope && !scope.controller.signal.aborted;
  }
  cancel = () => {
    this.scope?.controller.abort();
    this.scope = null;
  };
  activate = async (userId: number | null) => {
    this.cancel();
    this.state = empty(userId);
    this.publish({});
    if (userId === null) return;
    const scope: Scope = {
      userId,
      controller: new AbortController(),
      revision: 0,
      busy: false,
      blocked: false,
    };
    this.scope = scope;
    try {
      const remote = await this.io.read(userId, scope.controller.signal);
      if (this.active(scope))
        this.publish({
          settings: copySettings(remote.settings),
          confirmed: remote,
          ready: true,
          loading: false,
        });
    } catch (error) {
      if (this.active(scope))
        this.publish({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "No se pudo cargar la configuración.",
          errorKind: "load",
        });
    }
  };
  update = (patch: Partial<NotificationSettings>): boolean => {
    const scope = this.scope;
    // Antes del GET confirmado no se puede sobrescribir la fila con defaults/caché antiguos.
    if (
      !scope ||
      !this.active(scope) ||
      !this.state.ready ||
      this.state.loading
    )
      return false;
    const next = copySettings({ ...this.state.settings, ...patch });
    try {
      validateNotificationSettings(next);
    } catch {
      return false;
    }
    if (equal(next, this.state.settings)) return true;
    scope.revision++;
    this.publish({ settings: next, dirty: true });
    void this.pump(scope);
    return true;
  };
  private async pump(scope: Scope) {
    if (
      !this.active(scope) ||
      scope.busy ||
      scope.blocked ||
      !this.state.dirty ||
      !this.state.confirmed
    )
      return;
    scope.busy = true;
    this.publish({ saving: true });
    try {
      while (this.active(scope) && this.state.dirty && this.state.confirmed) {
        const attempt = {
          snapshot: {
            settings: copySettings(this.state.settings),
            updatedAt: this.state.confirmed.updatedAt,
          },
          revision: scope.revision,
        };
        scope.attempt = attempt;
        const remote = await this.io.write(
          scope.userId,
          attempt.snapshot,
          scope.controller.signal,
        );
        if (!this.active(scope)) return;
        const latest = scope.revision === attempt.revision;
        this.publish({
          confirmed: remote,
          settings: latest
            ? copySettings(remote.settings)
            : this.state.settings,
          dirty: !latest,
          error: null,
          errorKind: null,
        });
      }
    } catch (error) {
      if (this.active(scope)) {
        scope.blocked = true;
        this.publish({
          error:
            error instanceof Error
              ? error.message
              : "No se pudo guardar la configuración.",
          errorKind:
            error instanceof ApiError && error.status === 409
              ? "conflict"
              : "save",
        });
      }
    } finally {
      scope.busy = false;
      if (this.active(scope)) this.publish({ saving: false });
    }
  }
  retry = async () => {
    const scope = this.scope;
    if (!scope || scope.busy) return;
    if (!this.state.ready || this.state.errorKind === "conflict") {
      await this.activate(scope.userId);
      return;
    }
    if (!this.state.dirty || !scope.attempt || !this.state.confirmed) return;
    scope.busy = true;
    this.publish({ saving: true });
    try {
      const remote = await this.io.read(scope.userId, scope.controller.signal);
      if (!this.active(scope)) return;
      // Un timeout no prueba que el PUT no haya llegado: reconciliar antes de repetir.
      const unchanged =
        remote.updatedAt === this.state.confirmed.updatedAt &&
        equal(remote.settings, this.state.confirmed.settings);
      const acknowledged = equal(
        remote.settings,
        scope.attempt.snapshot.settings,
      );
      if (!unchanged && !acknowledged) {
        this.publish({
          error:
            "La configuración cambió en otro dispositivo. Recarga para revisar los valores del servidor.",
          errorKind: "conflict",
        });
        return;
      }
      const latest = acknowledged && scope.revision === scope.attempt.revision;
      this.publish({
        confirmed: remote,
        settings: latest ? copySettings(remote.settings) : this.state.settings,
        dirty: latest ? false : this.state.dirty,
        error: null,
        errorKind: null,
      });
      scope.blocked = false;
    } catch (error) {
      if (this.active(scope))
        this.publish({
          error:
            error instanceof Error ? error.message : "No se pudo reintentar.",
          errorKind: "save",
        });
    } finally {
      scope.busy = false;
      if (this.active(scope)) {
        this.publish({ saving: false });
        if (!scope.blocked) void this.pump(scope);
      }
    }
  };
}
