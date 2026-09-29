import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Clock, CheckCircle, ArrowLeft, RefreshCw, MessageCircle, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useState, useEffect } from "react";
import { formatINR } from "@/lib/currency";

export default function Orders() {
  const { user, isLoggedIn, orders } = useAuth();
  const [, setLocation] = useLocation();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
  const [exchangeOrder, setExchangeOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsAuthDialogOpen(true);
    }
  }, [isLoggedIn]);

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDeliveryDateText = (deliveryDate: string, status: string) => {
    const delivery = new Date(deliveryDate);
    const today = new Date();
    const diffDays = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (status === "Delivered") {
      return `Delivered on ${formatDate(deliveryDate)}`;
    }

    if (diffDays === 0) return "Arriving today";
    if (diffDays === 1) return "Arriving tomorrow";
    if (diffDays <= 7) return `Arriving by ${delivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`;
    return `Arriving by ${formatDate(deliveryDate)}`;
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { label: "Order Placed", completed: true },
      { label: "Order Confirmed", completed: status !== "Pending" },
      { label: "Packed", completed: ["Shipped", "Out for Delivery", "Delivered"].includes(status) },
      { label: "Shipped", completed: ["Shipped", "Out for Delivery", "Delivered"].includes(status), current: status === "Shipped" },
      { label: "Out for Delivery", completed: ["Out for Delivery", "Delivered"].includes(status), current: status === "Out for Delivery" },
      { label: "Delivered", completed: status === "Delivered", current: status === "Delivered" }
    ];
    return steps;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-500 mb-8">You need to be logged in to view your orders.</p>
            <Button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-dialog'))} size="lg" className="bg-primary text-white hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
        <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
      </div>
    );
  }

  // If tracking an order, show tracking view
  if (trackingOrder) {
    const order = orders.find(o => o.id === trackingOrder);
    if (!order) {
      setTrackingOrder(null);
      return null;
    }

    const trackingSteps = getTrackingSteps(order.status);

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setTrackingOrder(null)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Track Order #{order.id}</h1>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  📦 Arriving by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{getDeliveryDateText(order.estimatedDelivery, order.status)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Clock className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 ${step.current ? 'font-bold text-green-600' : 'text-gray-600'}`}>
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Delivering to:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold">{user?.name}</p>
                    <p>{order.address?.houseFlat}, {order.address?.streetArea}</p>
                    <p>{order.address?.city}, {order.address?.state}</p>
                    <p>{order.address?.pinCode}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Truck className="w-4 h-4 text-secondary mt-0.5" />
                    <div>
                      <p className="font-medium">📍 Dispatching from</p>
                      <p className="text-gray-600">Krishna Electronics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm mt-3">
                    <Package className="w-4 h-4 text-secondary mt-0.5" />
                    <div>
                      <p className="font-medium">📍 Delivering to</p>
                      <p className="text-gray-600">{order.address?.city}, {order.address?.state}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">* Delivery location is estimated</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If exchange support is open, show exchange form
  if (exchangeOrder) {
    const order = orders.find(o => o.id === exchangeOrder);
    if (!order) {
      setExchangeOrder(null);
      return null;
    }

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setExchangeOrder(null)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Exchange Support</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-6 h-6" />
                🔄 Exchange Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Need help with an exchange?</p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Product:</span>
                  <p className="font-medium">{order.items.map(item => item.name).join(', ')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for exchange</label>
                <select className="w-full border rounded-md p-2">
                  <option value="">Select a reason</option>
                  <option value="defective">Product is defective</option>
                  <option value="damaged">Product arrived damaged</option>
                  <option value="wrong">Wrong product delivered</option>
                  <option value="not-working">Product not working as expected</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <a
                href="https://wa.me/919814193459"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>

              <p className="text-xs text-gray-500 text-center">
                Krishna Electronics supports EXCHANGE ONLY. No returns or refunds.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-6 rounded-full">
                <Package size={48} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Button onClick={() => setLocation("/shop")} size="lg" className="bg-primary text-white hover:bg-primary/90">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getOrderStatusIcon(order.status)}
                      <span className="font-medium">{order.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-white p-1">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold">{formatINR(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <p className="text-sm text-gray-600 capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Estimated Delivery</h3>
                      <p className="text-sm text-gray-600">{getDeliveryDateText(order.estimatedDelivery, order.status)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-lg">{formatINR(order.total)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setTrackingOrder(order.id)} variant="outline" className="flex-1">
                      <Truck className="mr-2 h-4 w-4" />
                      Track Order
                    </Button>
                    <Button onClick={() => setExchangeOrder(order.id)} variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Exchange Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  );
}
