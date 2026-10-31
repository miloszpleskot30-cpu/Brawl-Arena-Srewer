const { Server, Room } = require("colyseus");

class ArenaRoom extends Room {
  onCreate() {
    this.maxClients = 4;
    this.players = new Map();

    console.log("Utworzono pokój:", this.roomId);

    this.onMessage("move", (client, data) => {
      const player = this.players.get(client.sessionId);
      if (!player || !data) return;

      const x = Number(data.x);
      const y = Number(data.y);

      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      player.x = Math.max(0, Math.min(1000, x));
      player.y = Math.max(0, Math.min(1000, y));

      this.broadcast("players", Array.from(this.players.values()));
    });

    this.onMessage("chooseCharacter", (client, data) => {
      const player = this.players.get(client.sessionId);
      if (!player || typeof data?.character !== "string") return;

      player.character = data.character.slice(0, 30);

      this.broadcast("players", Array.from(this.players.values()));
    });
  }

  onJoin(client, options) {
    const name =
      typeof options?.name === "string"
        ? options.name.slice(0, 20)
        : "Gracz";

    this.players.set(client.sessionId, {
      id: client.sessionId,
      name,
      character: "Duch",
      x: 500,
      y: 500
    });

    this.broadcast("players", Array.from(this.players.values()));

    console.log(name, "dołączył do pokoju");
  }

  onLeave(client) {
    this.players.delete(client.sessionId);
    this.broadcast("players", Array.from(this.players.values()));
  }
}

const gameServer = new Server();

gameServer.define("arena", ArenaRoom);

const port = Number(process.env.PORT) || 2567;

gameServer.listen(port);

console.log("Brawl Arena Legends działa na porcie:", port);
