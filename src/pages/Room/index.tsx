import { For, Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { JSONCodec } from "nats.ws";
import { ExistMsg, JoinRoomMsg, Msg } from "~/data/interfaces";
import { setState, state } from "~/state";
import { isFullscreen } from "~/utils";
import Player from "./Player";

type PlayerList = Record<string, number>;

const sc = JSONCodec();

export default () => {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const isFs = isFullscreen(ref);

  const params = useParams();
  const navigate = useNavigate();

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

    const topic = `room.${roomName}`;

    const sub = nc.subscribe(topic);

    const joinMsg: JoinRoomMsg = {
      type: "join",
      username,
      tenbou: state.tenbou,
    };

    nc.publish(topic, sc.encode(joinMsg));

    for await (const m of sub) {
      const res = sc.decode(m.data) as Msg;

      switch (res.type) {
        case "join": {
          setPlayers(res.username, () => res.tenbou);

          if (res.username !== username) {
            const existMsg: ExistMsg = {
              type: "exist",
              username,
              tenbou: state.tenbou,
            };

            nc.publish(topic, sc.encode(existMsg));
          }

          break;
        }

        case "exist": {
          setPlayers(res.username, () => res.tenbou);
          break;
        }

        case "pay": {
          setPlayers(res.from, (prev) => prev - res.value);
          setPlayers(res.to, (prev) => prev + res.value);

          if (res.from === username) {
            setState("tenbou", (prev) => prev - res.value);
          }

          if (res.to === username) {
            setState("tenbou", (prev) => prev + res.value);
          }

          break;
        }
      }
    }
  });

  return (
    <div
      ref={setRef}
      class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200"
    >
      <div class="flex space-x-4">
        <span class="text-2xl">Room {decodeURIComponent(params.name)}</span>
        <Show when={!isFs()}>
          <button
            class="rounded-sm bg-green-400 px-2 py-1 text-white shadow-sm transition-colors hover:bg-green-500 focus:bg-green-500 active:bg-green-600"
            onClick={() => {
              const curRef = ref();

              if (typeof curRef !== "undefined") {
                curRef.requestFullscreen();
              }
            }}
          >
            全屏
          </button>
        </Show>
      </div>
      <div class="w-4/5 max-w-5xl rounded bg-white p-4 shadow">
        <For each={Object.entries(players).sort(([_a, a], [_b, b]) => b - a)}>
          {([username, tenbou]) => (
            <Player
              container={ref()}
              topic={`room.${params.name.trim()}`}
              username={username}
              tenbou={tenbou}
            />
          )}
        </For>
      </div>
    </div>
  );
};
