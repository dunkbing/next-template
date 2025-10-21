"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { createSale } from "@/app/actions/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Check } from "lucide-react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { state, total, dispatch } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "QR" | "BANK_TRANSFER"
  >("CASH");
  const [cashAmount, setCashAmount] = useState(total.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const change = Number.parseFloat(cashAmount) - total;

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Note: You'll need to get these from your app state/context
      const storeId = 1; // TODO: Get from current store context
      const registerSessionId = 1; // TODO: Get from current session

      const result = await createSale({
        storeId,
        registerSessionId,
        items: state.lines.map((line) => ({
          variantId: line.variantId,
          qty: line.qty,
          price: line.price.toString(),
          discount: line.discount.toString(),
          tax: line.tax.toString(),
        })),
        payments: [
          {
            method: paymentMethod,
            amount: total.toString(),
          },
        ],
      });

      if ("error" in result) {
        setError(result.error || "Failed to process payment");
      } else {
        setSuccess(true);
        dispatch({ type: "CLEAR" });
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-gray-500">Thank you for your purchase</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-3xl font-bold">₫{total.toLocaleString()}</div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["CASH", "CARD", "QR", "BANK_TRANSFER"] as const).map(
                (method) => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method)}
                    type="button"
                  >
                    {method}
                  </Button>
                ),
              )}
            </div>
          </div>

          {/* Cash Amount */}
          {paymentMethod === "CASH" && (
            <div>
              <Label htmlFor="cash-amount">Cash Received</Label>
              <Input
                id="cash-amount"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                step="1000"
                min={total}
                className="mt-2"
              />
              {change >= 0 && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Change: </span>
                  <span className="font-semibold">
                    ₫{change.toLocaleString()}
                  </span>
                </div>
              )}
              {change < 0 && (
                <div className="mt-2 text-sm text-red-600">
                  Insufficient amount
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || (paymentMethod === "CASH" && change < 0)}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
