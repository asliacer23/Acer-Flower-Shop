import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data || undefined;
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// CRUD Operations
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return false;
  }
};
