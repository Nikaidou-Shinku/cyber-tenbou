import { onCleanup, onMount } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import { connect } from "nats.ws";
import { setState, state } from "~/state";
import { Home, Room } from "~/pages";

export default () => {
  onMount(async () => {
    // TODO: maybe don't hard code the url
    const ns = await connect({ servers: "ws://106.14.154.205:4223" });
    setState("server", () => ns);
    console.info(`Connected to ${ns.getServer()}.`);
  });

  onCleanup(async () => {
    const server = state.server;

    if (server !== null) {
      await server.close();
      console.info("Connection closed.");
    }
  });

  return (
    <Routes>
      <Route path="/room/:name" component={Room} />
      <Route path="/" component={Home} />
    </Routes>
  );
};
