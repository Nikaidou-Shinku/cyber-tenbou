import { For, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { state } from "~/state";
import Player from "./Player";
import { textEncoder } from "~/utils";

type PlayerList = Record<string, number>;

// FIXME: 笑死，留了俩后门在这儿🤣
declare global {
  interface Window {
    restartGame: () => Promise<void>;
    setTenbou: (username: string, tenbou: number) => Promise<void>;
  }
}

export default () => {
  const navigate = useNavigate();
  const params = useParams();

  const [players, setPlayers] = createStore<PlayerList>({});

  onMount(async () => {
    const username = state.username;

    if (username === null) {
      console.warn("Please login first.");
      navigate("/");
      return;
    }

    const nc = state.server;

    if (nc === null) {
      console.error("Server was not connected.");
      return;
    }

    const roomName = params.name.trim();

    if (roomName === "") {
      console.error("Room name can not be empty.");
      navigate("/");
      return;
    }

    const js = nc.jetstream();
    const kv = await js.views.kv("tenbou");

    const iter = await kv.watch({ key: `${roomName}.*` });

    const self = await kv.get(`${roomName}.${username}`);
    if (self === null) {
      await kv.put(`${roomName}.${username}`, "250");
    }

    // FIXME: remove these
    window.restartGame = async () => {
      await kv.destroy();
      console.info("Ok");
    };

    window.setTenbou = async (username: string, tenbou: number) => {
      if (tenbou % 100 !== 0) {
        console.error("点棒数必须是 100 的倍数！");
        return;
      }

      await kv.put(`${roomName}.${username}`, `${tenbou / 100}`);
      console.info("Ok");
    };

    for await (const e of iter) {
      const name = e.key.split(".")[1];
      const value = parseInt(e.string());
      setPlayers(name, () => value);
    }
  });

  return (
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <div class="flex space-x-4">
        <span class="text-2xl">Room {textEncoder.decode(params.name)}</span>
      </div>
      <div class="w-4/5 max-w-5xl rounded bg-white p-4 shadow">
        <For each={Object.entries(players).sort(([_a, a], [_b, b]) => b - a)}>
          {([username, tenbou]) => (
            <Player
              roomName={params.name.trim()}
              username={username}
              tenbou={tenbou}
            />
          )}
        </For>
      </div>
    </div>
  );
};
