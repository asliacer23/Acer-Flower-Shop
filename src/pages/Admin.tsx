import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, TrendingUp, Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { Order, Product } from '@/types';
import { getOrders, updateOrderStatus } from '@/services/orders';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { user, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    featured: false,
  });

  useEffect(() => {
    // Wait until auth is done loading
    if (isLoading) {
      return;
    }

    // Check if user is admin
    if (!user || !hasRole('admin')) {
      console.warn('User is not admin or not logged in. User:', user);
      navigate('/');
      return;
    }

    loadOrders();
    loadProducts();
  }, [user, hasRole, navigate, isLoading]);

  const loadOrders = async () => {
    const allOrders = await getOrders();
    setOrders(allOrders);
  };

  const loadProducts = async () => {
    const allProducts = await getProducts();
    setProducts(allProducts);
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    toast({ title: 'Order status updated' });
    loadOrders();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      featured: false,
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsProductDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      featured: product.featured || false,
    });
    setIsProductDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500',
      stock: parseInt(formData.stock) || 0,
      featured: formData.featured,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({ title: 'Product updated successfully' });
      } else {
        await createProduct(productData);
        toast({ title: 'Product created successfully' });
      }
      setIsProductDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      toast({ title: 'Product deleted successfully' });
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product.',
        variant: 'destructive',
      });
    }
  };

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container py-8 flex items-center justify-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  // Redirect if not admin
  if (!user || !hasRole('admin')) {
    return (
      <PageWrapper>
        <div className="container py-8 flex items-center justify-center min-h-[400px]">
          <p>Access denied. You must be an admin to view this page.</p>
        </div>
      </PageWrapper>
    );
  }

  const stats = {
    totalOrders: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
  };

  return (
    <PageWrapper>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Orders and Products */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">#{order.id}</span>
                            <Badge>{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            ₱{order.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'processing')}
                            >
                              Process
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Management</CardTitle>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="relative aspect-square mb-3 rounded overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                            {product.featured && (
                              <Badge variant="secondary" className="ml-2">Featured</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">
                              ₱{product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Stock: {product.stock}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openEditDialog(product)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? 'Update the product details below.'
                  : 'Fill in the details to create a new product.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rose Bouquet"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beautiful red roses perfect for any occasion"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45.99"
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bouquets">Bouquets</SelectItem>
                    <SelectItem value="Plants">Plants</SelectItem>
                    <SelectItem value="Arrangements">Arrangements</SelectItem>
                    <SelectItem value="Gifts">Gifts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Mark as Featured
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{deletingProduct?.name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingProduct(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageWrapper>
  );
}
