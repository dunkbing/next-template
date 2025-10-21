import { CartProvider } from "@/contexts/CartContext";
import POSInterface from "@/components/pos/POSInterface";

export default function POSPage() {
  return (
    <CartProvider>
      <div className="h-screen bg-gray-50">
        <POSInterface />
      </div>
    </CartProvider>
  );
}
