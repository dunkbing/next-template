"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import ProductSearch from "./ProductSearch";
import CartDisplay from "./CartDisplay";
import PaymentModal from "./PaymentModal";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function POSInterface() {
  const { state, total } = useCart();
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="flex h-full">
      {/* Left Panel - Cart */}
      <div className="w-1/2 border-r bg-white p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Cart</h2>
          <div className="text-sm text-gray-500">
            {state.lines.length} items
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <CartDisplay />
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₫{total.toLocaleString()}</span>
          </div>
          <Button
            onClick={() => setShowPayment(true)}
            disabled={state.lines.length === 0}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Checkout
          </Button>
        </div>
      </div>

      {/* Right Panel - Product Search */}
      <div className="w-1/2 bg-gray-50 p-4">
        <ProductSearch />
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
