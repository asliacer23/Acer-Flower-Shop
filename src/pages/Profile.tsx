import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { getOrders } from '@/services/orders';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    getOrders(user.id).then(setOrders);
  }, [user, navigate]);

  if (!user) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <PageWrapper>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">
                <Package className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No orders yet. Start shopping to see your orders here!
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">₱{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="wishlist">
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Wishlist feature coming soon!
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}
