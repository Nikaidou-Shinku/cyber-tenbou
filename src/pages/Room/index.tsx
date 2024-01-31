import { For, Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { state } from "~/state";
import Player from "./Player";
import { textEncoder } from "~/utils";
import { JetStreamClient } from "nats.ws";
import { PayRecord } from "~/data/PayRecord";

/**
 * 若进入的房间在一段时间（如下毫秒钟数）内没有进行操作后，再次进入时会清空房间。
 */
const RoomClearMilliseconds = 7200 * 1000;

export interface Room {
  /**
   * 编码后房间名
   */
  name: string;

  /**
   * 清空房间
   */
  restart: () => Promise<void>;

  /**
   * 增加支付记录
   * @param record 支付记录
   */
  add: (record: PayRecord) => Promise<void>;

  /**
   * 让一个玩家加入房间
   * @param username 玩家名
   */
  join: (username: string) => Promise<void>;
}

const getRoom = async (
  js: JetStreamClient,
  roomName: string,
  onPay?: (record: PayRecord) => void,
) => {
  let kv = await js.views.kv(roomName);

  // 检查这个房间是否有时间记录
  const dateStr = await kv.get("time");
  if (dateStr !== null) {
    // 不为空，检查这个房间上次操作的时间
    const last = Number.parseInt(dateStr.string());
    console.log(
      `Room last modified time: ${new Date(last).toLocaleTimeString()}.`,
    );
    const current = new Date().getTime();

    // 如果超过了时间，销毁并重新创建kv对象
    if (last + RoomClearMilliseconds <= current) {
      console.log(`Clearing the room ...`);
      await kv.destroy();
      kv = await js.views.kv(roomName);
    } else {
      // 房间里仍有游戏正在进行
      // 获取当前房间里的玩家，并初始化他们的点棒
      const playerIter = await kv.keys("players.*");
      for await (const key of playerIter) {
        const name = key.split(".")[1];
        console.log(`${textEncoder.decode(name)} is in the room.`);
        setPlayers(name, 250);
      }
    }
  }

  // 创建返回值
  const room: Room = {
    name: roomName,
    restart: async () => {
      await kv.destroy();
    },
    add: async (record: PayRecord) => {
      // 使用这次操作创建的时间来作为unique key
      await kv.put(`record.${new Date().getTime()}`, JSON.stringify(record));

      // 每次操作后，将这次操作的时间记录，以便之后清空房间
      // 由于使用的是客户端的时间，不同机器上的时间可能没有同步，但无视掉这个问题
      await kv.put("time", new Date().getTime().toString());
    },

    join: async (username: string) => {
      await kv.put(`players.${username}`, username);
    },
  };

  // 启动异步方法

  // 读取当前房间的所有记录，再根据记录调整点棒
  const recordIter = await kv.watch({ key: "record.*" });
  (async () => {
    for await (const e of recordIter) {
      // 将e中存储的以json形式保存的PayRecord恢复并通知外界
      const record = e.json<PayRecord>();
      console.log(
        `${textEncoder.decode(record.payer)} payed ${
          record.count * 100
        } tenbou to ${textEncoder.decode(record.receiver)}.`,
      );
      if (onPay !== undefined) onPay(record);
    }
  })();

  // 监视是否有新玩家进入
  const playerIter = await kv.watch({ key: "players.*" });
  (async () => {
    for await (const e of playerIter) {
      // 作为一个新玩家进入房间时，老玩家也会触发监听函数（但已经之前就处理过了），所以如果是老玩家就不处理。
      const name = e.string();
      if (name in players) continue;

      console.log(`${textEncoder.decode(name)} joined the room.`);
      setPlayers(name, 250);
    }
  })();

  return room;
};

type PlayerList = Record<string, number>;
const [players, setPlayers] = createStore<PlayerList>({});

export default () => {
  const navigate = useNavigate();
  const params = useParams();

  // 收到新的PayRecord时的监听函数
  const onPay = (record: PayRecord) => {
    setPlayers(record.payer, () => players[record.payer] - record.count);
    setPlayers(record.receiver, () => players[record.receiver] + record.count);
  };

  const [currentRoom, setCurrentRoom] = createSignal<Room | null>(null);

  onMount(async () => {
    const username = state.username;
    const roomName = params.name.trim();

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

    if (roomName === "") {
      console.error("Room name can not be empty.");
      navigate("/");
      return;
    }

    const js = nc.jetstream();

    const room = await getRoom(js, roomName, onPay);
    setCurrentRoom(room);

    room.join(username);
  });

  return (
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <div class="flex space-x-4">
        <span class="text-2xl">Room {textEncoder.decode(params.name)}</span>
      </div>
      <div class="w-4/5 max-w-5xl rounded bg-white p-4 shadow">
        <Show when={currentRoom()}>
          {(room) => {
            return (
              <For
                each={Object.entries(players).sort(([_a, a], [_b, b]) => b - a)}
              >
                {([username, tenbou]) => (
                  <Player room={room()} username={username} tenbou={tenbou} />
                )}
              </For>
            );
          }}
        </Show>
      </div>
    </div>
  );
};
