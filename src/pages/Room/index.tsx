import { For, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { JSONCodec } from "nats.ws";
import { ExistMsg, JoinRoomMsg, Msg } from "~/data/interfaces";
import { state } from "~/state";
import Player from "./Player";

type PlayerList = Record<string, number>;

const sc = JSONCodec();

export default () => {
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
    };

    nc.publish(topic, sc.encode(joinMsg));

    for await (const m of sub) {
      const res = sc.decode(m.data) as Msg;

      switch (res.type) {
        case "join": {
          setPlayers(res.username, () => 250);

          if (res.username !== username) {
            const existMsg: ExistMsg = {
              type: "exist",
              username,
              tenbou: players[username],
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
          break;
        }
      }
    }
  });

  return (
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <span class="text-2xl">Room {params.name}</span>
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
