import { store } from "../stores/store";
import { basketApi } from "../stores/basketApi";
import { toast } from "react-toastify";

export const handleAddToCart = async (productId: number, quantity: number) => {
    const cachedBasket = basketApi.endpoints.getBasket.select()(store.getState()).data;
    const existed = cachedBasket?.items.some(i => i.productId === productId) ?? false;

    try {
        await store.dispatch(
            basketApi.endpoints.addProductToBasket.initiate([{ productId, quantity }])
        ).unwrap();
        toast.success(existed ? "Quantity updated" : "Product added to cart");
    } catch (error) {
        toast.error("Failed to add product to cart");
    }
};