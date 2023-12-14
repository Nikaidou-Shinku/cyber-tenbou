import { Show, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { connect } from "nats.ws";
import { setState, state } from "~/state";
import { Home, Room } from "~/pages";

export default () => {
  onMount(async () => {
    // TODO: maybe don't hard code the url
    const ns = await connect({ servers: "wss://tenbou.yurzhang.com/ws" });

    setState("server", () => ns);
    console.info(`Connected to ${ns.getServer()}.`);

    await ns.closed();
    setState("server", () => null);
    console.warn("Disconnected.");
  });

  onCleanup(async () => {
    const server = state.server;

    if (server !== null) {
      await server.close();
      console.info("Connection closed.");
    }
  });

  return (
    <>
      <Router>
        <Route path="/room/:name" component={Room} />
        <Route path="/" component={Home} />
      </Router>
      <Portal>
        <div class="fixed right-2 top-2">
          <Show
            when={state.server !== null}
            fallback={
              <span class="rounded bg-red-600 p-1 text-white">连接已断开</span>
            }
          >
            <span class="rounded bg-green-600 p-1 text-white">
              已接入赛博点棒网络
            </span>
          </Show>
        </div>
        <div class="fixed bottom-2 left-0 right-0 flex justify-center">
          <span>当前版本：v0.2.0</span>
        </div>
      </Portal>
    </>
  );
};
