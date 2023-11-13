import { createStore } from "solid-js/store";
import { NatsConnection } from "nats.ws";

interface AppState {
  username: string | null;
  server: NatsConnection | null;
}

export const [state, setState] = createStore<AppState>({
  username: null,
  server: null,
});
