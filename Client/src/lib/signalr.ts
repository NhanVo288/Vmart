import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { API_ORIGIN } from "../config/constants";

let connection: HubConnection | null = null;

export function getProductHubConnection(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(`${API_ORIGIN}/hubs/products`, {
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
