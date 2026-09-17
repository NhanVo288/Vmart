import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { HubConnectionState } from "@microsoft/signalr";
import { getProductHubConnection, stopProductHubConnection } from "../lib/signalr";
import { baseApi } from "../stores/baseApi";
import type { RootState } from "../stores/store";
import type { IAdminNotification } from "../types/adminNotification";

export function useSignalR() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // Only connect for Staff (Admins and Vendors)
  const isStaff = user?.roles?.includes("Admin") || user?.roles?.includes("Vendor");
  const shouldConnect = isAuthenticated && isStaff;

  useEffect(() => {
    if (!shouldConnect) {
      stopProductHubConnection();
      return;
    }

    const connection = getProductHubConnection();

    const handleProductCreated = () => {
      dispatch(baseApi.util.invalidateTags(["Product"]));
    };

    const handleProductUpdated = () => {
      dispatch(baseApi.util.invalidateTags(["Product"]));
    };

    const handleProductDeleted = () => {
      dispatch(baseApi.util.invalidateTags(["Product"]));
    };

    const handleReceiveAdminNotification = (notification: IAdminNotification) => {
      dispatch(baseApi.util.invalidateTags(["AdminNotification"]));
      toast.info(`🔔 ${notification.message}`, {
        position: "bottom-right",
        autoClose: 5000,
      });
    };

    connection.on("ProductCreated", handleProductCreated);
    connection.on("ProductUpdated", handleProductUpdated);
    connection.on("ProductDeleted", handleProductDeleted);
    connection.on("ReceiveAdminNotification", handleReceiveAdminNotification);

    if (connection.state === HubConnectionState.Disconnected) {
      connection.start().catch((err) => {
        console.error("SignalR Connection Error: ", err);
      });
    }

    return () => {
      connection.off("ProductCreated", handleProductCreated);
      connection.off("ProductUpdated", handleProductUpdated);
      connection.off("ProductDeleted", handleProductDeleted);
      connection.off("ReceiveAdminNotification", handleReceiveAdminNotification);
      stopProductHubConnection();
    };
  }, [dispatch, shouldConnect]);
}
