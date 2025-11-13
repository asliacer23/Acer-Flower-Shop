import { Order, CartItem } from '@/types';
import { supabase } from '@/lib/supabase';

export const createOrder = async (
  items: CartItem[],
  customerName: string,
  address: string,
  paymentMethod: string,
  userId?: string
): Promise<Order | null> => {
  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      items,
      total,
      status: 'pending',
      customerName,
      address,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage first (immediate) - use userId as key for user-specific orders
    const storageKey = userId ? `orders-${userId}` : 'orders-guest';
    const orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
    orders.push(order);
    localStorage.setItem(storageKey, JSON.stringify(orders));

    // Try to save to Supabase (background)
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId || null,
          customer_name: customerName,
          address,
          payment_method: paymentMethod,
          status: 'pending',
          total,
        }])
        .select()
        .single();
      
      if (!orderError && orderData) {
        // Create order items in Supabase
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }));
        
        await supabase
          .from('order_items')
          .insert(orderItems);
      }
    } catch (supabaseError) {
      console.warn('Supabase save failed, but order saved locally:', supabaseError);
      // Order is already saved in localStorage, so we continue
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

export const getOrders = async (userId?: string): Promise<Order[]> => {
  try {
    // Get from localStorage first (fast) - use userId as key for user-specific orders
    const storageKey = userId ? `orders-${userId}` : 'orders-guest';
    const localOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Try to get from Supabase too (background)
    try {
      let query = supabase.from('orders').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: ordersData, error: ordersError } = await query.order('created_at', { ascending: false });
      
      if (!ordersError && ordersData && ordersData.length > 0) {
        // Fetch order items for each order
        const orders: Order[] = [];
        for (const orderData of ordersData) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*, products(*)')
            .eq('order_id', orderData.id);
          
          if (!itemsError && itemsData) {
            const items: CartItem[] = (itemsData || []).map(item => ({
              id: item.products.id,
              name: item.products.name,
              description: item.products.description,
              price: item.price,
              category: item.products.category,
              image: item.products.image,
              stock: item.products.stock,
              featured: item.products.featured,
              quantity: item.quantity,
            }));
            
            orders.push({
              id: orderData.id,
              userId: orderData.user_id,
              items,
              total: orderData.total,
              status: orderData.status,
              customerName: orderData.customer_name,
              address: orderData.address,
              paymentMethod: orderData.payment_method,
              createdAt: orderData.created_at,
            });
          }
        }
        
        // Return Supabase orders if available, otherwise localStorage
        if (orders.length > 0) {
          return orders;
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase fetch failed, using localStorage:', supabaseError);
    }

    return localOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    // Check localStorage first - need to check all user orders
    // Get from all possible user storage keys
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('orders-'));
    for (const key of allKeys) {
      const orders = JSON.parse(localStorage.getItem(key) || '[]');
      const localOrder = orders.find((order: Order) => order.id === orderId);
      if (localOrder) {
        return localOrder;
      }
    }

    // Try Supabase
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (!orderError && orderData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', orderId);
        
        if (!itemsError && itemsData) {
          const items: CartItem[] = (itemsData || []).map(item => ({
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.price,
            category: item.products.category,
            image: item.products.image,
            stock: item.products.stock,
            featured: item.products.featured,
            quantity: item.quantity,
          }));
          
          return {
            id: orderData.id,
            userId: orderData.user_id,
            items,
            total: orderData.total,
            status: orderData.status,
            customerName: orderData.customer_name,
            address: orderData.address,
            paymentMethod: orderData.payment_method,
            createdAt: orderData.created_at,
          };
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase fetch failed:', supabaseError);
    }

    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
): Promise<Order | null> => {
  try {
    // Update localStorage - search all user orders
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('orders-'));
    let updatedOrder: Order | null = null;
    
    for (const key of allKeys) {
      const orders = JSON.parse(localStorage.getItem(key) || '[]');
      const index = orders.findIndex((order: Order) => order.id === orderId);
      
      if (index !== -1) {
        orders[index].status = status;
        localStorage.setItem(key, JSON.stringify(orders));
        updatedOrder = orders[index];
        break;
      }
    }

    // Try to update Supabase too
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (!orderError && orderData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', orderId);
        
        if (!itemsError && itemsData) {
          const items: CartItem[] = (itemsData || []).map(item => ({
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.price,
            category: item.products.category,
            image: item.products.image,
            stock: item.products.stock,
            featured: item.products.featured,
            quantity: item.quantity,
          }));
          
          return {
            id: orderData.id,
            userId: orderData.user_id,
            items,
            total: orderData.total,
            status: orderData.status,
            customerName: orderData.customer_name,
            address: orderData.address,
            paymentMethod: orderData.payment_method,
            createdAt: orderData.created_at,
          };
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase update failed, using localStorage:', supabaseError);
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
};
