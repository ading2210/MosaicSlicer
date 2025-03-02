//this file contains an rpc implementation for running functions and generators on web workers

class RPCFunction {
  constructor(func_name) {
    this.func_name = func_name;
  }

  create_msg(event, data) {
    return { func_name: this.func_name, event, data }
  }
}

export class HostRPCFunction extends RPCFunction {
  constructor(func_name, worker) {
    super(func_name);
    this.worker = worker;
    this.on_msg = () => { };
    this.worker.addEventListener("message", (event) => {
      let msg = event.data;
      if (msg.func_name !== this.func_name)
        return;
      this.on_msg(msg);
    });
  }

  msg_promise() {
    return new Promise((resolve) => {
      this.on_msg = resolve;
    });
  }

  async * call(...args) {
    this.worker.postMessage(this.create_msg("call", args));
    while (true) {
      let msg = await this.msg_promise();
      if (msg.event === "error")
        throw msg.data;
      yield [msg.event, msg.data];
      if (msg.event === "done")
        break;
    }
  }

  async call_once(...args) {
    for await (let [event, data] of this.call(...args)) {
      if (event === "done")
        return data;
    }
  }
}

export class WorkerRPCFunction extends RPCFunction {
  constructor(func_name) {
    super(func_name);
  }

  send(event, data) {
    globalThis.postMessage(this.create_msg(event, data));
  }

  call(...args) {
    try {
      let ret = this.run(...args);
      this.send("done", ret);
    }
    catch (e) {
      this.send("error", e);
    }
  }
}

export class SimpleRPCFunction extends WorkerRPCFunction {
  constructor(func_name, callback) {
    super(func_name);
    this.callback = callback;
  }

  run(...args) {
    return this.callback(...args);
  }

  static create(func_name, callback) {
    return class extends SimpleRPCFunction {
      constructor() {
        super(func_name, callback);
      }
    }
  }
}

export function wait_for_worker(worker) {
  return new Promise(resolve => {
    let callback = (event) => {
      if (event.data !== true) return;
      resolve();
      worker.removeEventListener("message", callback);
    }
    worker.addEventListener("message", callback);
  });
}
