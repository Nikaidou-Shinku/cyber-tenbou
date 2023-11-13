import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { JSONCodec } from "nats.ws";
import { state } from "~/state";

const sc = JSONCodec();

export default () => {
  const navigate = useNavigate();

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

    const sub = nc.subscribe(`login.${username}`);

    for await (const m of sub) {
      const res = sc.decode(m.data);
      console.log(res);
      // TODO
    }
  });

  return (
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <h1>Lobby!</h1>
      <h2>{state.username}</h2>
    </div>
  );
};
