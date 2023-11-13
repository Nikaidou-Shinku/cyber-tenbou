export interface JoinRoomMsg {
  type: "join";
  username: string;
}

export interface ExistMsg {
  type: "exist";
  username: string;
  tenbou: number;
}

export interface PayMsg {
  type: "pay";
  from: string;
  to: string;
  value: number;
}

export type Msg = JoinRoomMsg | ExistMsg | PayMsg;
