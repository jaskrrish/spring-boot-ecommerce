'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import { useUser } from '@/components/providers/user-provider';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user } = useUser();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderIds, setOrderIds] = useState<number[]>([]);

  if (!user) {
    return (
      <div className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Please Login</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to login to checkout
            </p>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add some products to checkout
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) return;

    setIsProcessing(true);
    const createdOrderIds: number[] = [];

    try {
      // Create an order for each item in the cart
      for (const item of items) {
        const response = await orderApi.create({
          userId: user.id,
          productId: item.product.id,
          quantity: item.quantity,
        });
        createdOrderIds.push(response.data.id);
      }

      // All orders created successfully
      setOrderIds(createdOrderIds);
      setOrderSuccess(true);
      clearCart();
      toast.success(`Successfully placed ${createdOrderIds.length} order${createdOrderIds.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to place some orders. Please check stock availability.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <CheckCircle className="h-20 w-20 text-green-600 mb-4" />
              <h2 className="text-3xl font-bold mb-2 text-green-900">Order Placed Successfully!</h2>
              <p className="text-muted-foreground text-center mb-6">
                Your {orderIds.length} order{orderIds.length > 1 ? 's have' : ' has'} been placed and will be processed soon.
              </p>
              <div className="flex gap-4">
                <Link href="/orders">
                  <Button>View My Orders</Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Review your order and complete your purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} will be ordered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ₹{(item.product.cost * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{user.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹0.00</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-2xl">
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> Separate orders will be created for each product
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing {items.length} Orders...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Place {items.length} Order{items.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                <Link href="/cart" className="w-full">
                  <Button variant="outline" className="w-full" disabled={isProcessing}>
                    Back to Cart
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
