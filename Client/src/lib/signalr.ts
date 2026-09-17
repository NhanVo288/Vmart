import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { API_BASE_URL } from "../config/constants";

let connection: HubConnection | null = null;

const HUB_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export function getProductHubConnection(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE_URL}/hubs/products`, {
      accessTokenFactory: () => localStorage.getItem("token") ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}

export function stopProductHubConnection() {
  if (connection) {
    connection.stop().catch(() => {});
    connection = null;
  }
}
