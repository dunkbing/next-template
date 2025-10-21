"use client";

import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus } from "lucide-react";

export default function CartDisplay() {
  const { state, dispatch } = useCart();

  if (state.lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-lg">Cart is empty</p>
        <p className="text-sm">Scan or search for products to add</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {state.lines.map((line) => (
        <div
          key={line.id}
          className="p-3 bg-gray-50 rounded-lg border hover:border-gray-300"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-medium">{line.productName}</div>
              <div className="text-sm text-gray-500">{line.variantName}</div>
              <div className="text-xs text-gray-400">{line.sku}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "REMOVE", id: line.id })}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  dispatch({
                    type: "UPDATE_QTY",
                    id: line.id,
                    qty: Math.max(1, line.qty - 1),
                  })
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={line.qty}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_QTY",
                    id: line.id,
                    qty: Math.max(1, Number.parseInt(e.target.value) || 1),
                  })
                }
                className="w-16 text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  dispatch({
                    type: "UPDATE_QTY",
                    id: line.id,
                    qty: line.qty + 1,
                  })
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">
                ₫{line.price.toLocaleString()} each
              </div>
              <div className="font-semibold">
                ₫{(line.qty * line.price - line.discount).toLocaleString()}
              </div>
            </div>
          </div>

          {line.discount > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Discount: -₫{line.discount.toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
