import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { formatINR } from "@/lib/currency";
import { Check, Truck, Shield, Clock, ArrowLeft, CreditCard, Smartphone, Building2, Wallet, IndianRupee, Plus, Edit, Trash2, MapPin, Star } from "lucide-react";

interface AddressFormData {
  fullName: string;
  mobileNumber: string;
  houseFlat: string;
  streetArea: string;
  city: string;
  state: string;
  pinCode: string;
  saveAddress: boolean;
}

interface PaymentFormData {
  method: string;
  upiId: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  bank: string;
}

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user, addOrder, setRedirectAfterLogin, savedAddresses, addSavedAddress, updateSavedAddress, deleteSavedAddress, setDefaultAddress } = useAuth();
  const { reduceStock, getStock } = useInventory();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"address" | "payment" | "confirmation">("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isLoggedIn) {
      setRedirectAfterLogin("/checkout");
      // Trigger auth dialog
      window.dispatchEvent(new CustomEvent('open-auth-dialog'));
    }
  }, [isLoggedIn, setRedirectAfterLogin]);

  // Listen for auth success to proceed with checkout
  useEffect(() => {
    if (isLoggedIn && !orderPlaced) {
      // User just logged in, proceed with checkout
    }
  }, [isLoggedIn, orderPlaced]);

  // Auto-select default address when saved addresses load
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(savedAddresses[0].id);
      }
      setShowAddressForm(false);
    } else {
      setShowAddressForm(true);
    }
  }, [savedAddresses]);

  const [address, setAddress] = useState<AddressFormData>({
    fullName: "",
    mobileNumber: "",
    houseFlat: "",
    streetArea: "",
    city: "",
    state: "",
    pinCode: "",
    saveAddress: false,
  });

  const [payment, setPayment] = useState<PaymentFormData>({
    method: "cod",
    upiId: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    bank: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!address.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(address.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number (10 digits starting with 6-9)";
    }
    if (!address.houseFlat.trim()) newErrors.houseFlat = "House/Flat/Building is required";
    if (!address.streetArea.trim()) newErrors.streetArea = "Street/Area is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";
    if (!address.pinCode.trim()) {
      newErrors.pinCode = "PIN code is required";
    } else if (!/^\d{6}$/.test(address.pinCode)) {
      newErrors.pinCode = "Invalid PIN code (6 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (payment.method === "upi") {
      if (!payment.upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
      } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(payment.upiId)) {
        newErrors.upiId = "Invalid UPI ID format";
      }
    }

    if (payment.method === "card") {
      if (!payment.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(payment.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Invalid card number (16 digits)";
      }
      if (!payment.cardName.trim()) newErrors.cardName = "Name on card is required";
      if (!payment.expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiryDate)) {
        newErrors.expiryDate = "Invalid expiry date (MM/YY)";
      }
      if (!payment.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(payment.cvv)) {
        newErrors.cvv = "Invalid CVV (3-4 digits)";
      }
    }

    if (payment.method === "netbanking") {
      if (!payment.bank) newErrors.bank = "Please select a bank";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      // Save address if checkbox is checked
      if (address.saveAddress) {
        addSavedAddress({
          label: addressLabel,
          fullName: address.fullName,
          mobile: address.mobileNumber,
          houseFlat: address.houseFlat,
          streetArea: address.streetArea,
          city: address.city,
          state: address.state,
          pinCode: address.pinCode,
          isDefault: isDefaultAddress
        });
      }
      setStep("payment");
    }
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressForm(false);
  };

  const handleEditAddress = (addressId: string) => {
    const addr = savedAddresses.find(a => a.id === addressId);
    if (addr) {
      setAddress({
        fullName: addr.fullName,
        mobileNumber: addr.mobile,
        houseFlat: addr.houseFlat,
        streetArea: addr.streetArea,
        city: addr.city,
        state: addr.state,
        pinCode: addr.pinCode,
        saveAddress: true
      });
      setAddressLabel(addr.label);
      setIsDefaultAddress(addr.isDefault);
      setEditingAddressId(addressId);
      setShowAddressForm(true);
    }
  };

  const handleUpdateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress() && editingAddressId) {
      updateSavedAddress(editingAddressId, {
        label: addressLabel,
        fullName: address.fullName,
        mobile: address.mobileNumber,
        houseFlat: address.houseFlat,
        streetArea: address.streetArea,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        isDefault: isDefaultAddress
      });
      if (isDefaultAddress) {
        setDefaultAddress(editingAddressId);
      }
      setEditingAddressId(null);
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      deleteSavedAddress(addressId);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(savedAddresses.length > 1 ? savedAddresses[0].id : null);
      }
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId);
  };

  const handleAddNewAddress = () => {
    setAddress({
      fullName: user?.name || "",
      mobileNumber: user?.mobile || "",
      houseFlat: "",
      streetArea: "",
      city: "",
      state: "",
      pinCode: "",
      saveAddress: true
    });
    setAddressLabel("Home");
    setIsDefaultAddress(savedAddresses.length === 0);
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  const getSelectedAddress = () => {
    if (selectedAddressId) {
      return savedAddresses.find(addr => addr.id === selectedAddressId);
    }
    return null;
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePayment()) {
      setIsProcessing(true);
      
      // Verify stock availability before processing
      let stockAvailable = true;
      const stockErrors: string[] = [];
      
      items.forEach((item) => {
        const currentStock = getStock(item.id);
        if (currentStock < item.quantity) {
          stockAvailable = false;
          stockErrors.push(`${item.name}: Only ${currentStock} available, you requested ${item.quantity}`);
        }
      });
      
      if (!stockAvailable) {
        setIsProcessing(false);
        alert("Stock Error:\n" + stockErrors.join("\n"));
        return;
      }
      
      // Simulate payment processing
      setTimeout(() => {
        // Deduct stock for each item
        let allStockDeducted = true;
        items.forEach((item) => {
          const deducted = reduceStock(item.id, item.quantity);
          if (!deducted) {
            allStockDeducted = false;
          }
        });
        
        if (!allStockDeducted) {
          setIsProcessing(false);
          alert("Some items went out of stock during checkout. Please try again.");
          return;
        }
        
        const newOrderId = "KE" + Date.now().toString().slice(-8);
        setOrderId(newOrderId);
        setOrderPlaced(true);
        setStep("confirmation");

        // Save order to user's order history with random delivery date (3-7 days)
        const deliveryDate = new Date();
        const deliveryDays = Math.floor(Math.random() * 5) + 3; // Random between 3-7 days
        deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

        // Use selected address (from saved addresses or form)
        const orderAddress = getSelectedAddress() || {
          fullName: address.fullName,
          mobile: address.mobileNumber,
          houseFlat: address.houseFlat,
          streetArea: address.streetArea,
          city: address.city,
          state: address.state,
          pinCode: address.pinCode
        };

        addOrder({
          items,
          total: cartTotal,
          paymentMethod: payment.method,
          address: orderAddress,
          status: "Confirmed",
          estimatedDelivery: deliveryDate.toISOString()
        });

        clearCart();
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPayment({ ...payment, cardNumber: formatted });
  };

  const handleBackToAddress = () => {
    setStep("address");
  };

  const handleContinueShopping = () => {
    setLocation("/shop");
  };

  const handleViewOrder = () => {
    // For now, just go back to shop since we don't have an orders page
    setLocation("/shop");
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add items to your cart before checkout.</p>
            <Button onClick={() => setLocation("/shop")} size="lg" className="bg-primary text-white hover:bg-primary/90">
              Start Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show auth dialog if not logged in (but don't redirect)
  if (!isLoggedIn && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-500 mb-8">You need to be logged in to proceed with checkout.</p>
            <Button onClick={() => window.dispatchEvent(new CustomEvent('open-auth-dialog'))} size="lg" className="bg-primary text-white hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const orderAddress = getSelectedAddress() || {
      fullName: address.fullName,
      mobile: address.mobileNumber,
      houseFlat: address.houseFlat,
      streetArea: address.streetArea,
      city: address.city,
      state: address.state,
      pinCode: address.pinCode
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-800">Order Placed Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-bold text-lg">{orderId}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{payment.method === "cod" ? "Cash on Delivery" : payment.method}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg text-green-600">{formatINR(cartTotal)}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck size={18} />
                    Delivery Address
                  </h3>
                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">{orderAddress.fullName}</p>
                    <p>+91 {orderAddress.mobile}</p>
                    <p>{orderAddress.houseFlat}, {orderAddress.streetArea}</p>
                    <p>{orderAddress.city}, {orderAddress.state} - {orderAddress.pinCode}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Estimated Delivery
                  </h3>
                  <p className="text-gray-700">{deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleContinueShopping} variant="outline" className="flex-1">
                    Continue Shopping
                  </Button>
                  <Button onClick={handleViewOrder} className="flex-1 bg-primary text-white hover:bg-primary/90">
                    View Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <Button variant="ghost" onClick={() => setLocation("/cart")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {step === "address" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Show saved addresses if available */}
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleSelectAddress(addr.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="radio"
                                    name="address"
                                    checked={selectedAddressId === addr.id}
                                    onChange={() => handleSelectAddress(addr.id)}
                                    className="w-4 h-4 accent-blue-500"
                                  />
                                  <span className="font-semibold">{addr.label}</span>
                                  {addr.isDefault && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-700 space-y-1 ml-6">
                                  <p className="font-medium">{addr.fullName}</p>
                                  <p>+91 {addr.mobile}</p>
                                  <p>{addr.houseFlat}, {addr.streetArea}</p>
                                  <p>{addr.city}, {addr.state} - {addr.pinCode}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleEditAddress(addr.id); }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {!addr.isDefault && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}
                                    className="h-8 w-8 p-0 text-yellow-600"
                                    title="Set as default"
                                  >
                                    <Star className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddNewAddress}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="w-full bg-primary text-white hover:bg-primary/90"
                        disabled={!selectedAddressId}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  )}

                  {/* Show address form */}
                  {showAddressForm && (
                    <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddressSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="addressLabel">Address Label *</Label>
                        <Input
                          id="addressLabel"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          placeholder="Home, Office, College, etc."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={address.fullName}
                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                            className={errors.fullName ? "border-red-500" : ""}
                          />
                          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                          <Label htmlFor="mobileNumber">Mobile Number *</Label>
                          <Input
                            id="mobileNumber"
                            value={address.mobileNumber}
                            onChange={(e) => setAddress({ ...address, mobileNumber: e.target.value })}
                            placeholder="10-digit number"
                            className={errors.mobileNumber ? "border-red-500" : ""}
                          />
                          {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="houseFlat">House/Flat/Building *</Label>
                        <Input
                          id="houseFlat"
                          value={address.houseFlat}
                          onChange={(e) => setAddress({ ...address, houseFlat: e.target.value })}
                          className={errors.houseFlat ? "border-red-500" : ""}
                        />
                        {errors.houseFlat && <p className="text-red-500 text-sm mt-1">{errors.houseFlat}</p>}
                      </div>

                      <div>
                        <Label htmlFor="streetArea">Street/Area *</Label>
                        <Input
                          id="streetArea"
                          value={address.streetArea}
                          onChange={(e) => setAddress({ ...address, streetArea: e.target.value })}
                          className={errors.streetArea ? "border-red-500" : ""}
                        />
                        {errors.streetArea && <p className="text-red-500 text-sm mt-1">{errors.streetArea}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            className={errors.city ? "border-red-500" : ""}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            className={errors.state ? "border-red-500" : ""}
                          />
                          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pinCode">PIN Code *</Label>
                        <Input
                          id="pinCode"
                          value={address.pinCode}
                          onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                          placeholder="6-digit PIN code"
                          className={errors.pinCode ? "border-red-500" : ""}
                        />
                        {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveAddress"
                          checked={address.saveAddress}
                          onCheckedChange={(checked) => setAddress({ ...address, saveAddress: checked as boolean })}
                        />
                        <Label htmlFor="saveAddress" className="cursor-pointer">Save this address for future orders</Label>
                      </div>

                      {address.saveAddress && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="defaultAddress"
                            checked={isDefaultAddress}
                            onCheckedChange={(checked) => setIsDefaultAddress(checked as boolean)}
                          />
                          <Label htmlFor="defaultAddress" className="cursor-pointer">Set as default address</Label>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {savedAddresses.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddressId(null);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90">
                          {editingAddressId ? "Update Address" : "Continue to Payment"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">2</span>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <div 
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${payment.method === "upi" ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setPayment({ ...payment, method: "upi" })}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="upi"
                          checked={payment.method === "upi"}
                          onChange={() => setPayment({ ...payment, method: "upi" })}
                          className="w-4 h-4 text-primary"
                        />
                        <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Smartphone className="w-5 h-5" />
                          <span>UPI</span>
                        </Label>
                      </div>

                      <div 
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${payment.method === "card" ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setPayment({ ...payment, method: "card" })}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="card"
                          checked={payment.method === "card"}
                          onChange={() => setPayment({ ...payment, method: "card" })}
                          className="w-4 h-4 text-primary"
                        />
                        <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                          <CreditCard className="w-5 h-5" />
                          <span>Credit/Debit Card</span>
                        </Label>
                      </div>

                      <div 
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${payment.method === "netbanking" ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setPayment({ ...payment, method: "netbanking" })}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="netbanking"
                          checked={payment.method === "netbanking"}
                          onChange={() => setPayment({ ...payment, method: "netbanking" })}
                          className="w-4 h-4 text-primary"
                        />
                        <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Building2 className="w-5 h-5" />
                          <span>Net Banking</span>
                        </Label>
                      </div>

                      <div 
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${payment.method === "wallet" ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setPayment({ ...payment, method: "wallet" })}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="wallet"
                          checked={payment.method === "wallet"}
                          onChange={() => setPayment({ ...payment, method: "wallet" })}
                          className="w-4 h-4 text-primary"
                        />
                        <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Wallet className="w-5 h-5" />
                          <span>Wallets</span>
                        </Label>
                      </div>

                      <div 
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer ${payment.method === "cod" ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => setPayment({ ...payment, method: "cod" })}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="cod"
                          checked={payment.method === "cod"}
                          onChange={() => setPayment({ ...payment, method: "cod" })}
                          className="w-4 h-4 text-primary"
                        />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                          <IndianRupee className="w-5 h-5" />
                          <span>Cash on Delivery</span>
                        </Label>
                      </div>
                    </div>

                    {/* Dynamic Payment Fields */}
                    {payment.method === "upi" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="upiId">UPI ID *</Label>
                          <Input
                            id="upiId"
                            value={payment.upiId}
                            onChange={(e) => setPayment({ ...payment, upiId: e.target.value })}
                            placeholder="yourname@upi"
                            className={errors.upiId ? "border-red-500" : ""}
                          />
                          {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Pay Now"}
                        </Button>
                      </div>
                    )}

                    {payment.method === "card" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            value={payment.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={errors.cardNumber ? "border-red-500" : ""}
                          />
                          {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cardName">Name on Card *</Label>
                          <Input
                            id="cardName"
                            value={payment.cardName}
                            onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                            placeholder="Name as on card"
                            className={errors.cardName ? "border-red-500" : ""}
                          />
                          {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                              id="expiryDate"
                              value={payment.expiryDate}
                              onChange={(e) => setPayment({ ...payment, expiryDate: e.target.value })}
                              placeholder="MM/YY"
                              maxLength={5}
                              className={errors.expiryDate ? "border-red-500" : ""}
                            />
                            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              value={payment.cvv}
                              onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                              placeholder="123"
                              maxLength={4}
                              type="password"
                              className={errors.cvv ? "border-red-500" : ""}
                            />
                            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Pay Securely"}
                        </Button>
                      </div>
                    )}

                    {payment.method === "netbanking" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="bank">Select Bank *</Label>
                          <Select value={payment.bank} onValueChange={(value) => setPayment({ ...payment, bank: value })}>
                            <SelectTrigger className={errors.bank ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select your bank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sbi">State Bank of India</SelectItem>
                              <SelectItem value="hdfc">HDFC Bank</SelectItem>
                              <SelectItem value="icici">ICICI Bank</SelectItem>
                              <SelectItem value="axis">Axis Bank</SelectItem>
                              <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                              <SelectItem value="pnb">Punjab National Bank</SelectItem>
                              <SelectItem value="bob">Bank of Baroda</SelectItem>
                              <SelectItem value="canara">Canara Bank</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.bank && <p className="text-red-500 text-sm mt-1">{errors.bank}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Continue to Payment"}
                        </Button>
                      </div>
                    )}

                    {payment.method === "wallet" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="wallet">Select Wallet *</Label>
                          <Select value={payment.bank} onValueChange={(value) => setPayment({ ...payment, bank: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your wallet" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paytm">Paytm</SelectItem>
                              <SelectItem value="phonepe">PhonePe</SelectItem>
                              <SelectItem value="amazon">Amazon Pay</SelectItem>
                              <SelectItem value="gpay">Google Pay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Pay with Wallet"}
                        </Button>
                      </div>
                    )}

                    {payment.method === "cod" && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <IndianRupee className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-600 mt-1">Pay cash upon delivery of your order. No additional charges.</p>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Place Order"}
                        </Button>
                      </div>
                    )}

                    <Button type="button" variant="outline" onClick={handleBackToAddress} className="w-full">
                      Back to Address
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-white p-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (included)</span>
                    <span>{formatINR(0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2 text-sm">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800">Your payment is secure. We use SSL encryption to protect your data.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
