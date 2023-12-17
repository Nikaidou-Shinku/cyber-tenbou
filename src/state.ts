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

// 在localStorage保存上次进入的用户名和房间名信息，方便快速进入
interface PlayerState {
  username: string;
  room: string;
}

const playerState: () => PlayerState | null = () => {
  const raw = localStorage.getItem("player");
  if (raw == null) return null;
  return JSON.parse(raw);
};

const setPlayerState = (newState: PlayerState) => {
  localStorage.setItem("player", JSON.stringify(newState));
};

export const usePlayerState = () => {
  return { getter: playerState, setter: setPlayerState };
};
