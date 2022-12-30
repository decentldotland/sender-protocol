import { NearBindgen, near, call, view } from "near-sdk-js";

@NearBindgen({})
class Registry {
  state: string = '{"1notif_channel_addr": "addr", "subscribers": []}';

  @view({})
  read(): string {
    return this.state;
  }

  @call({})
  subsribe(): void {
    const state = JSON.parse(this.state);
    const caller = near.signerAccountId();
    if (state.subscribers.includes(caller)) {
      near.panic(`${caller} is a subscriber`);
    }

    state.subscribers.push(caller);
    this.state = JSON.stringify(state);
    near.log(`${caller} unsubsribed`);
  }

  @call({})
  unsubsribe(): void {
    const state = JSON.parse(this.state);
    const caller = near.signerAccountId();
    if (!state.subscribers.includes(caller)) {
      near.panic(`${caller} is not a subscriber`);
    }

    const caller_index = state.subscribers.findIndex((user) => user === caller);
    state.subscribers.splice(caller_index, 1);
    this.state = JSON.stringify(state);
    near.log(`${caller} unsubsribed`);
  }
}
