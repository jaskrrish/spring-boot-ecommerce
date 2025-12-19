'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Loader2, Package, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { productApi, orderApi } from '@/lib/api';
import { useUser } from '@/components/providers/user-provider';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import Image from 'next/image';

export default function ProductsPage() {
  const { user } = useUser();
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartQuantity, setCartQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAvailable();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await productApi.search(searchQuery);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };
  const handleAddToCartClick = (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    setSelectedProduct(product);
    setCartQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (cartQuantity < 1 || cartQuantity > selectedProduct.quantity) {
      toast.error(`Please enter a valid quantity (1-${selectedProduct.quantity})`);
      return;
    }

    addToCart(selectedProduct, cartQuantity);
    toast.success(`${selectedProduct.productName} added to cart!`);
    setSelectedProduct(null);
  };

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Products</h1>
          <p className="text-muted-foreground">Discover amazing products at great prices</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          {searchQuery && (
            <Button variant="outline" onClick={() => { setSearchQuery(''); fetchProducts(); }}>
              Clear
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new products'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow flex flex-col">
                {product.productUrl && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
                    <Image
                      src={product.productUrl} 
                      alt={product.productName}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        console.error('Failed to load image:', product.productUrl);
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl line-clamp-1">{product.productName}</CardTitle>
                    <Badge variant={product.quantity > 10 ? 'default' : 'destructive'}>
                      {product.quantity} in stock
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {product.productDesc || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <DollarSign className="h-6 w-6" />
                    {product.cost.toFixed(2)}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleAddToCartClick(product)}
                    disabled={product.quantity === 0}
                  >
                    <Plus className="h-4 w-4" />
                    {user ? 'Add to Cart' : 'Login to Add'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Dialog */}
      <Dialog open={selectedProduct !== null} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
            <DialogDescription>
              Select quantity for {selectedProduct?.productName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold">{selectedProduct.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{selectedProduct.cost.toFixed(2)} per unit
                  </p>
                </div>
                <Badge>{selectedProduct.quantity} available</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct.quantity}
                  value={cartQuantity}
                  onChange={(e) => setCartQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex justify-between items-center text-lg font-semibold p-4 bg-primary/10 rounded-lg">
                <span>Subtotal:</span>
                <span className="text-primary">
                  ₹{(selectedProduct.cost * cartQuantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddToCart} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
