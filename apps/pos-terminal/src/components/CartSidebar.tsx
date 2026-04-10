import { useState } from "react";
import { apiService } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { usePOSStore } from "../store/posStore";
import ManagerControls from "./ManagerControls";

type PaymentOption = "cash" | "card" | "gcash";

const paymentOptions: Array<{ id: PaymentOption; label: string }> = [
  { id: "cash", label: "Cash" },
  { id: "gcash", label: "GCash" },
  { id: "card", label: "Card" },
];

export default function CartSidebar() {
  const { cart, removeFromCart, updateCartItem, clearCart } = usePOSStore();
  const { user, session_id, terminal_id } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("cash");

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price ?? 0) * item.quantity,
    0,
  );
  const vat = subtotal * 0.12;
  const total = subtotal + vat;

  const handleCheckout = async () => {
    if (!cart.length) {
      return;
    }

    setIsProcessing(true);
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: (Number(item.product.price ?? 0) * item.quantity).toFixed(
          2,
        ),
      }));

      await apiService.createOrder(
        session_id ?? "",
        terminal_id ?? "",
        user?.id ?? "",
        items,
        subtotal.toFixed(2),
        vat.toFixed(2),
        total.toFixed(2),
        paymentMethod,
      );

      clearCart();
      alert("Order created successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create order.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <aside className="flex  h-full flex-col border rounded-md border-slate-800 bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-lg font-semibold">Current Order</h2>
        <p className="text-sm text-slate-300">{cart.length} item(s)</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 scroll-y-custom">
        {cart.length === 0 ? (
          <p className="rounded-md border border-slate-800 bg-slate-900 px-3 py-4 text-sm text-slate-300">
            Your cart is empty. Add products from the menu to get started.
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-300">
                    ₱{Number(item.product.price ?? 0).toFixed(2)} each
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateCartItem(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-sm hover:bg-slate-800"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-sm hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm font-medium text-white">
                  ₱
                  {(Number(item.product.price ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4 border-t border-slate-800 px-4 py-4">
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (12%)</span>
            <span>₱{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-white">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Payment Method
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPaymentMethod(option.id)}
                className={`rounded-md border px-2 py-2 text-xs font-medium ${
                  paymentMethod === option.id
                    ? "border-slate-200 bg-slate-200 text-slate-900"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isProcessing || !cart.length}
          className="w-full rounded-md bg-slate-200 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </button>
        <button
          type="button"
          onClick={clearCart}
          disabled={!cart.length}
          className="w-full rounded-md border border-slate-700 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="border-t border-slate-800 px-4 py-3">
        <ManagerControls />
      </div>
    </aside>
  );
}
