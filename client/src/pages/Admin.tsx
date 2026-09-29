import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventory } from "@/context/InventoryContext";
import { useProducts } from "@/context/ProductContext";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Upload, Download, AlertCircle, CheckCircle, FileSpreadsheet, LogOut, Package, TrendingDown, AlertTriangle, Plus, Edit, Trash2, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/currency";

export default function AdminInventory() {
  const { importFromExcel, exportToExcel, updateStock, getStock } = useInventory();
  const { products, addProduct, updateProduct, deleteProduct, skuExists } = useProducts();
  const [, setLocation] = useLocation();
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Product Management State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFormData, setProductFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    image: "",
    color: "",
    ram: "",
    storage: "",
    description: "",
    warranty: "",
    delivery: ""
  });
  
  // Image handling state
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  
  const categories = ["Mobiles", "Laptops", "Televisions", "Refrigerators", "Air Conditioners", "Washing Machines", "Headphones", "Cameras", "Accessories", "Mixer Grinder", "Irons", "Chimney", "Gas Stoves"];
  const brands = ["Samsung", "LG", "Sony", "Apple", "OnePlus", "Xiaomi", "Realme", "Motorola", "OPPO", "HP", "Dell", "Lenovo", "ASUS", "Acer", "MSI", "Microsoft", "JBL", "Bose", "Logitech"];

  // Check admin session
  useEffect(() => {
    const adminSession = sessionStorage.getItem("krishna-admin-session");
    if (adminSession !== "authenticated") {
      setLocation("/admin");
    }
  }, [setLocation]);

  const handleLogout = () => {
    sessionStorage.removeItem("krishna-admin-session");
    sessionStorage.removeItem("krishna-admin-timestamp");
    setLocation("/admin");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        setUploadedData(data);
        setPreviewData(data);
        setShowPreview(true);
        
        setUploadStatus("success");
        setUploadMessage(`Successfully parsed ${data.length} product records. Review and apply changes.`);
      } catch (error) {
        setUploadStatus("error");
        setUploadMessage("Error parsing file. Please ensure it's a valid Excel/CSV file.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleApplyChanges = async () => {
    if (uploadedData.length > 0) {
      try {
        // First update inventory
        importFromExcel(uploadedData);
        
        // Then update products based on Excel data
        for (const row of uploadedData) {
          const productId = parseInt(row["Product ID"]);
          const existingProduct = products.find(p => p.id === productId);
          
          if (existingProduct) {
            // Update existing product with new data
            const updates: any = {};
            if (row["Product Name"]) updates.name = row["Product Name"];
            if (row["Brand"]) updates.brand = row["Brand"];
            if (row["Category"]) updates.category = row["Category"];
            if (row["Price"]) updates.price = parseFloat(row["Price"]);
            if (row["Original Price"]) updates.originalPrice = parseFloat(row["Original Price"]);
            if (row["Color"]) updates.color = row["Color"];
            if (row["RAM"]) updates.ram = row["RAM"];
            if (row["Storage"]) updates.storage = row["Storage"];
            if (row["Image"]) updates.image = row["Image"];
            if (row["Description"]) updates.description = row["Description"];
            
            if (Object.keys(updates).length > 0) {
              updateProduct(productId, updates);
            }
          } else if (row["Product Name"] && row["Price"] && !isNaN(productId)) {
            // Create new product if it doesn't exist
            const stock = parseInt(row["Stock Quantity"]) || 0;
            const newProduct = {
              name: row["Product Name"],
              brand: row["Brand"] || "Generic",
              category: row["Category"] || "Accessories",
              price: parseFloat(row["Price"]),
              originalPrice: row["Original Price"] ? parseFloat(row["Original Price"]) : undefined,
              sku: row["SKU"] || `KE-${row["Category"]?.substring(0, 3).toUpperCase() || "ACC"}-${Date.now()}`,
              image: row["Image"] || "/assets/generated_images/home_appliances_category_image.png",
              color: row["Color"] || undefined,
              ram: row["RAM"] || undefined,
              storage: row["Storage"] || undefined,
              description: row["Description"] || `${row["Product Name"]} with dependable performance, modern features, and GST-inclusive pricing from Krishna Electronics.`,
              rating: 4.0,
              reviews: 0,
              specs: {
                Brand: row["Brand"] || "Generic",
                Category: row["Category"] || "Accessories",
                Warranty: row["Warranty"] || "1 year brand warranty",
                Delivery: row["Delivery"] || "Free delivery across India"
              },
              status: (stock > 0 ? "available" : "out_of_stock") as "available" | "out_of_stock",
              stock: 0
            };

            const newProductId = await addProduct(newProduct);
            updateStock(newProductId, stock);
          }
        }
        
        setUploadStatus("success");
        setUploadMessage(`Successfully updated inventory and products for ${uploadedData.length} records.`);
        setShowPreview(false);
        setUploadedData([]);
      } catch (error) {
        console.error("Error applying Excel changes:", error);
        setUploadStatus("error");
        setUploadMessage("Error applying changes. Please check the data and try again.");
      }
    }
  };

  const handleCancelChanges = () => {
    setShowPreview(false);
    setUploadedData([]);
    setPreviewData(null);
  };

  const handleExportTemplate = () => {
    const templateData = products.map((product) => ({
      "Product ID": product.id,
      "Product Name": product.name,
      "Brand": product.brand,
      "Category": product.category,
      "Color": product.color || "",
      "RAM": product.ram || "",
      "Storage": product.storage || "",
      "Price": product.price,
      "Original Price": product.originalPrice || "",
      "Discount": product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0,
      "Stock Quantity": getStock(product.id),
      "SKU": product.sku,
      "Image": product.image,
      "Description": product.description,
      "Warranty": product.specs?.Warranty || "",
      "Delivery": product.specs?.Delivery || "",
      "Status": product.status
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "krishna_electronics_inventory_template.xlsx");
  };

  const handleExportCurrentInventory = () => {
    const inventoryData = products.map((product) => ({
      "Product ID": product.id,
      "Product Name": product.name,
      "Brand": product.brand,
      "Category": product.category,
      "Color": product.color || "",
      "RAM": product.ram || "",
      "Storage": product.storage || "",
      "Price": product.price,
      "Original Price": product.originalPrice || "",
      "Discount": product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0,
      "Stock Quantity": getStock(product.id),
      "SKU": product.sku,
      "Image": product.image,
      "Description": product.description,
      "Warranty": product.specs?.Warranty || "",
      "Delivery": product.specs?.Delivery || "",
      "Status": product.status
    }));

    const ws = XLSX.utils.json_to_sheet(inventoryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "krishna_electronics_current_inventory.xlsx");
  };

  const handleManualStockUpdate = (productId: number, newStock: string) => {
    const stock = parseInt(newStock);
    if (!isNaN(stock) && stock >= 0) {
      updateStock(productId, stock);
      setUploadStatus("success");
      setUploadMessage(`Updated stock for product ID ${productId} to ${stock}`);
    }
  };

  // Product Management Functions
  const handleAddProduct = async () => {
    // Validate required fields
    if (!productFormData.name || !productFormData.brand || !productFormData.category || 
        !productFormData.price || !productFormData.stock) {
      setUploadStatus("error");
      setUploadMessage("Please fill in all required fields");
      return;
    }

    const price = parseFloat(productFormData.price);
    const originalPrice = productFormData.originalPrice ? parseFloat(productFormData.originalPrice) : undefined;
    const stock = parseInt(productFormData.stock);

    if (isNaN(price) || price <= 0) {
      setUploadStatus("error");
      setUploadMessage("Please enter a valid price");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setUploadStatus("error");
      setUploadMessage("Please enter a valid stock quantity");
      return;
    }

    // Generate SKU if not provided
    const sku = productFormData.sku || `KE-${productFormData.category.substring(0, 3).toUpperCase()}-${Date.now()}`;

    // Check if SKU already exists
    if (skuExists(sku)) {
      setUploadStatus("error");
      setUploadMessage("A product with this SKU already exists. Please use a different SKU.");
      return;
    }

    // Use default image if not provided
    const image = productFormData.image || "/assets/generated_images/home_appliances_category_image.png";

    const newProduct = {
      name: productFormData.name,
      brand: productFormData.brand,
      category: productFormData.category,
      price,
      originalPrice,
      sku,
      image,
      color: productFormData.color || undefined,
      ram: productFormData.ram || undefined,
      storage: productFormData.storage || undefined,
      description: productFormData.description || `${productFormData.name} with dependable performance, modern features, and GST-inclusive pricing from Krishna Electronics.`,
      rating: 4.0,
      reviews: 0,
      specs: {
        Brand: productFormData.brand,
        Category: productFormData.category,
        Warranty: productFormData.warranty || "1 year brand warranty",
        Delivery: productFormData.delivery || "Free delivery across India"
      },
      status: (stock > 0 ? "available" : "out_of_stock") as "available" | "out_of_stock",
      stock: 0 // Will be updated by inventory system
    };

    try {
      setUploadStatus("idle");
      setUploadMessage("Adding product...");
      
      const newProductId = await addProduct(newProduct);
      
      // Small delay to ensure product is fully saved before updating stock
      setTimeout(() => {
        updateStock(newProductId, stock);
      }, 50);
      
      setUploadStatus("success");
      setUploadMessage(`Product "${productFormData.name}" added successfully`);
      setShowAddProductModal(false);
      resetProductForm();
      resetImageState();
    } catch (error) {
      console.error("Error adding product:", error);
      setUploadStatus("error");
      setUploadMessage(error instanceof Error ? error.message : "Unable to add product. Please check the product information and try again.");
      // Don't close the modal on error
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setProductFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      stock: getStock(product.id).toString(),
      sku: product.sku,
      image: product.image,
      color: product.color || "",
      ram: product.ram || "",
      storage: product.storage || "",
      description: product.description,
      warranty: product.specs?.Warranty || "",
      delivery: product.specs?.Delivery || ""
    });
    setImageInputUrl(product.image || "");
    setImagePreview(product.image || "");
    setImageError("");
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    // Validate required fields
    if (!productFormData.name || !productFormData.brand || !productFormData.category || 
        !productFormData.price || !productFormData.stock) {
      setUploadStatus("error");
      setUploadMessage("Please fill in all required fields");
      return;
    }

    const price = parseFloat(productFormData.price);
    const originalPrice = productFormData.originalPrice ? parseFloat(productFormData.originalPrice) : undefined;
    const stock = parseInt(productFormData.stock);

    if (isNaN(price) || price <= 0) {
      setUploadStatus("error");
      setUploadMessage("Please enter a valid price");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setUploadStatus("error");
      setUploadMessage("Please enter a valid stock quantity");
      return;
    }

    const updatedProduct = {
      name: productFormData.name,
      brand: productFormData.brand,
      category: productFormData.category,
      price,
      originalPrice,
      image: productFormData.image,
      color: productFormData.color || undefined,
      ram: productFormData.ram || undefined,
      storage: productFormData.storage || undefined,
      description: productFormData.description,
      specs: {
        ...selectedProduct.specs,
        Brand: productFormData.brand,
        Category: productFormData.category,
        Warranty: productFormData.warranty || "1 year brand warranty",
        Delivery: productFormData.delivery || "Free delivery across India"
      },
      status: (stock > 0 ? "available" : "out_of_stock") as "available" | "out_of_stock"
    };

    updateProduct(selectedProduct.id, updatedProduct);
    updateStock(selectedProduct.id, stock);
    
    setUploadStatus("success");
    setUploadMessage(`Product "${productFormData.name}" updated successfully`);
    setShowEditProductModal(false);
    setSelectedProduct(null);
    resetProductForm();
    resetImageState();
  };

  const handleDeleteProduct = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setUploadStatus("success");
      setUploadMessage(`Product "${selectedProduct.name}" deleted successfully`);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      name: "",
      brand: "",
      category: "",
      price: "",
      originalPrice: "",
      stock: "",
      sku: "",
      image: "",
      color: "",
      ram: "",
      storage: "",
      description: "",
      warranty: "",
      delivery: ""
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "OUT OF STOCK", color: "bg-red-100 text-red-700" };
    if (stock <= 5) return { text: "LOW STOCK", color: "bg-yellow-100 text-yellow-700" };
    return { text: "IN STOCK", color: "bg-green-100 text-green-700" };
  };

  // Image handling functions
  const handleImageUrlSubmit = async () => {
    if (!imageInputUrl.trim()) {
      setImageError("Please enter a URL");
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImagePreview("");

    try {
      const response = await fetch(`/api/fetch-product-image?url=${encodeURIComponent(imageInputUrl)}`);
      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setImagePreview(data.imageUrl);
        setProductFormData(prev => ({ ...prev, image: data.imageUrl }));
      } else {
        setImageError(data.error || "Failed to fetch image. Please try a direct image URL.");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setImageError("Failed to fetch image. Please try a direct image URL.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleUseImage = () => {
    if (imagePreview) {
      setProductFormData(prev => ({ ...prev, image: imagePreview }));
      setImageInputUrl("");
      setImageError("");
    }
  };

  const handleImageInputChange = (value: string) => {
    setImageInputUrl(value);
    setImageError("");
    
    // If it looks like a direct image URL, try to preview it immediately
    if (isDirectImageUrl(value)) {
      setImagePreview(value);
      setProductFormData(prev => ({ ...prev, image: value }));
    } else {
      setImagePreview("");
    }
  };

  const isDirectImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  const resetImageState = () => {
    setImageInputUrl("");
    setImagePreview("");
    setImageError("");
    setImageLoading(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate inventory stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + getStock(p.id), 0);
  const outOfStockCount = products.filter(p => getStock(p.id) === 0).length;
  const lastUpdated = sessionStorage.getItem("krishna-inventory-last-updated") 
    ? new Date(parseInt(sessionStorage.getItem("krishna-inventory-last-updated")!)).toLocaleString()
    : "Never";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">Manage product inventory through Excel/CSV files or manual updates.</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Stock</p>
                  <p className="text-2xl font-bold">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold">{outOfStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-semibold">{lastUpdated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <Card className="mb-8 border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Preview Changes</CardTitle>
              <CardDescription>
                {previewData.length} products will be updated. Review before applying.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto border rounded p-4 mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3">Product ID</th>
                      <th className="text-left py-2 px-3">Product Name</th>
                      <th className="text-left py-2 px-3">Stock</th>
                      <th className="text-left py-2 px-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-3">{row["Product ID"] || row["product_id"]}</td>
                        <td className="py-2 px-3 truncate max-w-xs">{row["Product Name"] || row["product_name"]}</td>
                        <td className="py-2 px-3">{row["Stock Quantity"] || row["stock_quantity"]}</td>
                        <td className="py-2 px-3">{row["Price"] || row["price"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCancelChanges} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleApplyChanges} className="bg-green-600 hover:bg-green-700">
                  Apply Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Upload Excel/CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>

              {uploadStatus !== "idle" && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  uploadStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {uploadStatus === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm">{uploadMessage}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleExportTemplate}
                  variant="outline"
                  className="w-full"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Excel Template
                </Button>
                <p className="text-xs text-gray-500">
                  Download a template with all current products to fill in inventory data.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleExportCurrentInventory}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Current Inventory
                </Button>
                <p className="text-xs text-gray-500">
                  Export current stock levels to Excel for offline editing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manual Stock Update Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Stock Update</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Product ID</th>
                    <th className="text-left py-2 px-3">Product Name</th>
                    <th className="text-left py-2 px-3">SKU</th>
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-left py-2 px-3">Current Stock</th>
                    <th className="text-left py-2 px-3">Update Stock</th>
                    <th className="text-left py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 15).map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{product.id}</td>
                      <td className="py-2 px-3 truncate max-w-xs">{product.name}</td>
                      <td className="py-2 px-3">{product.sku}</td>
                      <td className="py-2 px-3">{product.category}</td>
                      <td className="py-2 px-3">{getStock(product.id)}</td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          min="0"
                          defaultValue={getStock(product.id)}
                          className="w-24"
                          id={`stock-${product.id}`}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(`stock-${product.id}`) as HTMLInputElement;
                            handleManualStockUpdate(product.id, input.value);
                          }}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Showing first 15 products. Use Excel import for bulk updates.
            </p>
          </CardContent>
        </Card>

        {/* Product Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Product Management</CardTitle>
              <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-name">Product Name *</Label>
                        <Input
                          id="product-name"
                          value={productFormData.name}
                          onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-brand">Brand *</Label>
                        <Select value={productFormData.brand} onValueChange={(value) => setProductFormData({...productFormData, brand: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-category">Category *</Label>
                        <Select value={productFormData.category} onValueChange={(value) => setProductFormData({...productFormData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="product-sku">SKU</Label>
                        <Input
                          id="product-sku"
                          value={productFormData.sku}
                          onChange={(e) => setProductFormData({...productFormData, sku: e.target.value})}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-price">Selling Price *</Label>
                        <Input
                          id="product-price"
                          type="number"
                          value={productFormData.price}
                          onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                          placeholder="Enter selling price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-mrp">MRP/Original Price</Label>
                        <Input
                          id="product-mrp"
                          type="number"
                          value={productFormData.originalPrice}
                          onChange={(e) => setProductFormData({...productFormData, originalPrice: e.target.value})}
                          placeholder="Enter MRP"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-stock">Stock Quantity *</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          value={productFormData.stock}
                          onChange={(e) => setProductFormData({...productFormData, stock: e.target.value})}
                          placeholder="Enter stock quantity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-image">Product Image / Product Page URL</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id="product-image"
                              value={imageInputUrl}
                              onChange={(e) => handleImageInputChange(e.target.value)}
                              placeholder="Paste product page URL or direct image URL"
                              className="flex-1"
                            />
                            <Button 
                              onClick={handleImageUrlSubmit} 
                              disabled={imageLoading}
                              size="sm"
                            >
                              {imageLoading ? "Loading..." : "Fetch"}
                            </Button>
                          </div>
                          
                          {imageError && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {imageError}
                            </div>
                          )}
                          
                          {imagePreview && (
                            <div className="border rounded p-3 space-y-2">
                              <div className="text-sm font-medium">Image Preview:</div>
                              <img 
                                src={imagePreview} 
                                alt="Product preview" 
                                className="w-32 h-32 object-contain rounded"
                                onError={() => setImageError("Failed to load image preview")}
                              />
                              <Button 
                                onClick={handleUseImage}
                                size="sm"
                                className="w-full"
                              >
                                Use This Image
                              </Button>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Option 1: Paste product page URL (auto-extract image)</div>
                            <div>Option 2: Paste direct image URL</div>
                            <div>Option 3: Leave empty to use default image</div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Current image: {productFormData.image || "None"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="product-color">Color</Label>
                        <Input
                          id="product-color"
                          value={productFormData.color}
                          onChange={(e) => setProductFormData({...productFormData, color: e.target.value})}
                          placeholder="e.g., Black, Blue"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-ram">RAM</Label>
                        <Input
                          id="product-ram"
                          value={productFormData.ram}
                          onChange={(e) => setProductFormData({...productFormData, ram: e.target.value})}
                          placeholder="e.g., 8GB"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-storage">Storage</Label>
                        <Input
                          id="product-storage"
                          value={productFormData.storage}
                          onChange={(e) => setProductFormData({...productFormData, storage: e.target.value})}
                          placeholder="e.g., 128GB"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        value={productFormData.description}
                        onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-warranty">Warranty</Label>
                        <Input
                          id="product-warranty"
                          value={productFormData.warranty}
                          onChange={(e) => setProductFormData({...productFormData, warranty: e.target.value})}
                          placeholder="e.g., 1 year brand warranty"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-delivery">Delivery Info</Label>
                        <Input
                          id="product-delivery"
                          value={productFormData.delivery}
                          onChange={(e) => setProductFormData({...productFormData, delivery: e.target.value})}
                          placeholder="e.g., Free delivery across India"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {setShowAddProductModal(false); resetProductForm(); resetImageState();}}>Cancel</Button>
                    <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">Add Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products by name, brand, category, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-3">Image</th>
                    <th className="text-left py-3 px-3">Product Name</th>
                    <th className="text-left py-3 px-3">Brand</th>
                    <th className="text-left py-3 px-3">Category</th>
                    <th className="text-left py-3 px-3">SKU</th>
                    <th className="text-left py-3 px-3">Price</th>
                    <th className="text-left py-3 px-3">MRP</th>
                    <th className="text-left py-3 px-3">Discount</th>
                    <th className="text-left py-3 px-3">Stock</th>
                    <th className="text-left py-3 px-3">Status</th>
                    <th className="text-left py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = getStock(product.id);
                    const stockStatus = getStockStatus(stock);
                    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-contain rounded" />
                        </td>
                        <td className="py-3 px-3 font-medium max-w-xs truncate">{product.name}</td>
                        <td className="py-3 px-3">{product.brand}</td>
                        <td className="py-3 px-3">{product.category}</td>
                        <td className="py-3 px-3">{product.sku}</td>
                        <td className="py-3 px-3">{formatINR(product.price)}</td>
                        <td className="py-3 px-3">{product.originalPrice ? formatINR(product.originalPrice) : "-"}</td>
                        <td className="py-3 px-3">{discount > 0 ? `${discount}%` : "-"}</td>
                        <td className="py-3 px-3">{stock}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Showing {filteredProducts.length} products
            </p>
          </CardContent>
        </Card>

        {/* Edit Product Modal */}
        <Dialog open={showEditProductModal} onOpenChange={setShowEditProductModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product-name">Product Name *</Label>
                  <Input
                    id="edit-product-name"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-brand">Brand *</Label>
                  <Select value={productFormData.brand} onValueChange={(value) => setProductFormData({...productFormData, brand: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product-category">Category *</Label>
                  <Select value={productFormData.category} onValueChange={(value) => setProductFormData({...productFormData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-product-sku">SKU</Label>
                  <Input
                    id="edit-product-sku"
                    value={productFormData.sku}
                    onChange={(e) => setProductFormData({...productFormData, sku: e.target.value})}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product-price">Selling Price *</Label>
                  <Input
                    id="edit-product-price"
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                    placeholder="Enter selling price"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-mrp">MRP/Original Price</Label>
                  <Input
                    id="edit-product-mrp"
                    type="number"
                    value={productFormData.originalPrice}
                    onChange={(e) => setProductFormData({...productFormData, originalPrice: e.target.value})}
                    placeholder="Enter MRP"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product-stock">Stock Quantity *</Label>
                  <Input
                    id="edit-product-stock"
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({...productFormData, stock: e.target.value})}
                    placeholder="Enter stock quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-image">Product Image / Product Page URL</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="edit-product-image"
                        value={imageInputUrl}
                        onChange={(e) => handleImageInputChange(e.target.value)}
                        placeholder="Paste product page URL or direct image URL"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleImageUrlSubmit} 
                        disabled={imageLoading}
                        size="sm"
                      >
                        {imageLoading ? "Loading..." : "Fetch"}
                      </Button>
                    </div>
                    
                    {imageError && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {imageError}
                      </div>
                    )}
                    
                    {imagePreview && (
                      <div className="border rounded p-3 space-y-2">
                        <div className="text-sm font-medium">Image Preview:</div>
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="w-32 h-32 object-contain rounded"
                          onError={() => setImageError("Failed to load image preview")}
                        />
                        <Button 
                          onClick={handleUseImage}
                          size="sm"
                          className="w-full"
                        >
                          Use This Image
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Option 1: Paste product page URL (auto-extract image)</div>
                      <div>Option 2: Paste direct image URL</div>
                      <div>Option 3: Leave empty to use default image</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-product-color">Color</Label>
                  <Input
                    id="edit-product-color"
                    value={productFormData.color}
                    onChange={(e) => setProductFormData({...productFormData, color: e.target.value})}
                    placeholder="e.g., Black, Blue"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-ram">RAM</Label>
                  <Input
                    id="edit-product-ram"
                    value={productFormData.ram}
                    onChange={(e) => setProductFormData({...productFormData, ram: e.target.value})}
                    placeholder="e.g., 8GB"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-storage">Storage</Label>
                  <Input
                    id="edit-product-storage"
                    value={productFormData.storage}
                    onChange={(e) => setProductFormData({...productFormData, storage: e.target.value})}
                    placeholder="e.g., 128GB"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-product-description">Description</Label>
                <Textarea
                  id="edit-product-description"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product-warranty">Warranty</Label>
                  <Input
                    id="edit-product-warranty"
                    value={productFormData.warranty}
                    onChange={(e) => setProductFormData({...productFormData, warranty: e.target.value})}
                    placeholder="e.g., 1 year brand warranty"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-delivery">Delivery Info</Label>
                  <Input
                    id="edit-product-delivery"
                    value={productFormData.delivery}
                    onChange={(e) => setProductFormData({...productFormData, delivery: e.target.value})}
                    placeholder="e.g., Free delivery across India"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setShowEditProductModal(false); setSelectedProduct(null); resetProductForm(); resetImageState();}}>Cancel</Button>
              <Button onClick={handleUpdateProduct} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. The product will be removed from all customer-facing pages.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setShowDeleteDialog(false); setSelectedProduct(null);}}>Cancel</Button>
              <Button onClick={confirmDeleteProduct} className="bg-red-600 hover:bg-red-700">Delete Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Excel File Format Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Required Columns:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><strong>Product ID</strong> - Unique identifier for the product</li>
                <li><strong>Stock Quantity</strong> - Current stock level (must be a number)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Optional Columns:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Product Name, Brand, Category, Color, RAM, Storage</li>
                <li>Price, Original Price, SKU, Image, Description</li>
                <li>Rating, Reviews, Warranty, Delivery, Status</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Notes:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Only Product ID and Stock Quantity are required for inventory updates</li>
                <li>Stock cannot be negative</li>
                <li>Download the template to see the correct format</li>
                <li>Changes are saved to browser localStorage</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
