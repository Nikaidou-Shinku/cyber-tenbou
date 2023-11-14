import { createStore } from "solid-js/store";
import { NatsConnection } from "nats.ws";

interface AppState {
  username: string | null;
  tenbou: number;
  server: NatsConnection | null;
}

export const [state, setState] = createStore<AppState>({
  username: null,
  tenbou: 250,
  server: null,
});
