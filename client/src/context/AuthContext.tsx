import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  houseFlat: string;
  streetArea: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  paymentMethod: string;
  address: any;
  status: string;
  createdAt: string;
  estimatedDelivery: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (emailOrMobile: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "userId" | "createdAt">) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (redirect: string | null) => void;
  buyNowProduct: any | null;
  setBuyNowProduct: (product: any | null) => void;
  savedAddresses: SavedAddress[];
  addSavedAddress: (address: Omit<SavedAddress, "id">) => void;
  updateSavedAddress: (id: string, address: Partial<SavedAddress>) => void;
  deleteSavedAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<any | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("krishna-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    const savedRedirect = localStorage.getItem("krishna-redirect");
    if (savedRedirect) {
      setRedirectAfterLogin(savedRedirect);
      localStorage.removeItem("krishna-redirect");
    }
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("krishna-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("krishna-user");
    }
  }, [user]);

  // Load orders from localStorage (user-specific)
  useEffect(() => {
    if (user) {
      try {
        const savedOrders = localStorage.getItem(`krishna-orders-${user.id}`);
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error("Failed to parse orders", e);
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  }, [user]);

  // Save orders to localStorage on change (user-specific)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`krishna-orders-${user.id}`, JSON.stringify(orders));
    }
  }, [orders, user]);

  // Load saved addresses from localStorage (user-specific)
  useEffect(() => {
    if (user) {
      try {
        const savedAddressesData = localStorage.getItem(`krishna-addresses-${user.id}`);
        if (savedAddressesData) {
          setSavedAddresses(JSON.parse(savedAddressesData));
        } else {
          setSavedAddresses([]);
        }
      } catch (e) {
        console.error("Failed to parse saved addresses", e);
        setSavedAddresses([]);
      }
    } else {
      setSavedAddresses([]);
    }
  }, [user]);

  // Save addresses to localStorage on change (user-specific)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`krishna-addresses-${user.id}`, JSON.stringify(savedAddresses));
    }
  }, [savedAddresses, user]);

  // Save redirect to localStorage
  useEffect(() => {
    if (redirectAfterLogin) {
      localStorage.setItem("krishna-redirect", redirectAfterLogin);
    }
  }, [redirectAfterLogin]);

  const login = async (emailOrMobile: string, password: string): Promise<boolean> => {
    // Demo authentication - check against localStorage users
    const users = JSON.parse(localStorage.getItem("krishna-users") || "[]");
    const foundUser = users.find(
      (u: any) => (u.email === emailOrMobile || u.mobile === emailOrMobile) && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }

    return false;
  };

  const signup = async (name: string, email: string, mobile: string, password: string): Promise<boolean> => {
    // Demo signup - save to localStorage
    const users = JSON.parse(localStorage.getItem("krishna-users") || "[]");
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email || u.mobile === mobile)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      mobile,
      password
    };

    users.push(newUser);
    localStorage.setItem("krishna-users", JSON.stringify(users));

    // Auto login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);

    return true;
  };

  const logout = () => {
    setUser(null);
    setRedirectAfterLogin(null);
    setBuyNowProduct(null);
  };

  const addOrder = (order: Omit<Order, "id" | "userId" | "createdAt">) => {
    if (!user) return;

    const newOrder: Order = {
      ...order,
      id: "KE" + Date.now().toString().slice(-8),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  const addSavedAddress = (address: Omit<SavedAddress, "id">) => {
    const newAddress: SavedAddress = {
      ...address,
      id: Date.now().toString()
    };

    // If setting as default, remove default from others
    if (address.isDefault) {
      setSavedAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: false }))
      );
    }

    setSavedAddresses((prev) => [newAddress, ...prev]);
  };

  const updateSavedAddress = (id: string, address: Partial<SavedAddress>) => {
    setSavedAddresses((prev) =>
      prev.map((addr) =>
        addr.id === id ? { ...addr, ...address } : addr
      )
    );
  };

  const deleteSavedAddress = (id: string) => {
    setSavedAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setSavedAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        orders,
        addOrder,
        redirectAfterLogin,
        setRedirectAfterLogin,
        buyNowProduct,
        setBuyNowProduct,
        savedAddresses,
        addSavedAddress,
        updateSavedAddress,
        deleteSavedAddress,
        setDefaultAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
