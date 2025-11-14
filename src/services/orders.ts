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
    
    // Create order in Supabase
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
    
    if (orderError) throw orderError;
    if (!orderData) throw new Error('No order data returned');

    // Create order items in Supabase
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Decrease stock for each item in the order
    for (const item of items) {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (fetchError) {
        console.warn(`Error fetching product ${item.id}:`, fetchError);
        continue;
      }

      const newStock = Math.max(0, (product?.stock || 0) - item.quantity);

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);

      if (updateError) {
        console.warn(`Error updating stock for product ${item.id}:`, updateError);
      }
    }

    // Return formatted order
    const order: Order = {
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

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

export const getOrders = async (userId?: string): Promise<Order[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: ordersData, error: ordersError } = await query;
    
    if (ordersError) throw ordersError;
    if (!ordersData || ordersData.length === 0) return [];

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
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    if (!orderData) return null;

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;

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
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (orderError) throw orderError;
    if (!orderData) return null;

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;

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
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
};
