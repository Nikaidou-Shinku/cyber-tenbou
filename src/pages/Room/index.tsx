import { For, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { ExistMsg, JoinRoomMsg, Msg } from "~/data/interfaces";
import { setState, state } from "~/state";
import Player from "./Player";

type PlayerList = Record<string, number>;

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

    const topic = `room.${roomName}`;

    const sub = nc.subscribe(topic);

    const joinMsg: JoinRoomMsg = {
      type: "join",
      username,
      tenbou: state.tenbou,
    };

    nc.publish(topic, JSON.stringify(joinMsg));

    for await (const m of sub) {
      const res: Msg = m.json();

      switch (res.type) {
        case "join": {
          setPlayers(res.username, () => res.tenbou);

          if (res.username !== username) {
            const existMsg: ExistMsg = {
              type: "exist",
              username,
              tenbou: state.tenbou,
            };

            nc.publish(topic, JSON.stringify(existMsg));
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
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <div class="flex space-x-4">
        <span class="text-2xl">Room {decodeURIComponent(params.name)}</span>
      </div>
      <div class="w-4/5 max-w-5xl rounded bg-white p-4 shadow">
        <For each={Object.entries(players).sort(([_a, a], [_b, b]) => b - a)}>
          {([username, tenbou]) => (
            <Player
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
