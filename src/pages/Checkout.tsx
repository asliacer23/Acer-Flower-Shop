import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/orders';
import { addressService } from '@/services/addresses';
import { useToast } from '@/hooks/use-toast';
import { CartItem, Address } from '@/types';
import { motion } from 'framer-motion';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addressForm, setAddressForm] = useState({
    phone_number: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    postal_code: '',
    street_address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');

  // Get items from location state (single product) or use full cart
  const checkoutItems: CartItem[] = location.state?.items || cart;
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isSingleProduct = location.state?.isSingleProduct || false;

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const addresses = await addressService.getUserAddresses();
      setSavedAddresses(addresses);
      
      // Set default address if available
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setUseDefaultAddress(true);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseDefaultAddress(true);
    // Clear manual form when selecting saved address
    setAddressForm({
      phone_number: '',
      region: '',
      province: '',
      city: '',
      barangay: '',
      postal_code: '',
      street_address: '',
    });
  };

  const handleUseManualAddress = () => {
    setUseDefaultAddress(false);
    setSelectedAddressId('');
  };

  const getFullAddress = (): string => {
    if (useDefaultAddress && selectedAddressId) {
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
      if (addr) {
        return `${addr.street_address}, ${addr.barangay}, ${addr.city}, ${addr.province}, ${addr.region} ${addr.postal_code}`;
      }
    } else if (!useDefaultAddress) {
      return `${addressForm.street_address}, ${addressForm.barangay}, ${addressForm.city}, ${addressForm.province}, ${addressForm.region} ${addressForm.postal_code}`;
    }
    return '';
  };

  const getPhoneNumber = (): string => {
    if (useDefaultAddress && selectedAddressId) {
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
      return addr?.phone_number || '';
    }
    return addressForm.phone_number;
  };

  if (checkoutItems.length === 0) {
    return (
      <PageWrapper>
        <div className="container py-20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">No items to checkout</h2>
          <Button onClick={() => navigate('/cart')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Cart
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const handleCheckout = async () => {
    if (!customerName || !getFullAddress() || !paymentMethod) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all checkout fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!getPhoneNumber()) {
      toast({
        title: 'Missing phone number',
        description: 'Please provide a phone number for delivery contact.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder(checkoutItems, customerName, getFullAddress(), paymentMethod, user?.id);
      
      // Save address if using manual entry and not already saved
      if (!useDefaultAddress && user?.id) {
        try {
          await addressService.createAddress({
            full_name: customerName,
            phone_number: getPhoneNumber(),
            region: addressForm.region,
            province: addressForm.province,
            city: addressForm.city,
            barangay: addressForm.barangay,
            postal_code: addressForm.postal_code,
            street_address: addressForm.street_address,
            label: 'Delivery',
            is_default: false,
          });
        } catch (addrError) {
          // Address save error won't block order placement
          console.log('Address save skipped (may already exist):', addrError);
        }
      }
      
      // Only clear cart if checking out full cart, not single product
      if (!isSingleProduct) {
        clearCart();
      }
      
      toast({
        title: 'Order placed!',
        description: 'Your order has been successfully placed.',
      });
      navigate('/profile');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageWrapper>
      <div className="container py-6 md:py-12 px-2 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-10"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cart')}
            className="text-primary hover:bg-primary/10 mb-4 text-xs md:text-sm"
          >
            <ArrowLeft className="mr-2 h-3 md:h-4 w-3 md:w-4" />
            Back to Cart
          </Button>
          <h1 className="text-2xl md:text-5xl font-bold text-foreground">Order Confirmation</h1>
          <p className="text-muted-foreground text-sm md:text-lg mt-2">Complete your purchase information</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-border bg-muted/30 p-3 md:p-6">
                <CardTitle className="text-lg md:text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 md:pt-6 space-y-2 md:space-y-4 p-3 md:p-6">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-2 md:pb-4 border-b border-border/50">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-xs md:text-base truncate">{item.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-primary text-xs md:text-base ml-2 flex-shrink-0">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="pt-2 md:pt-4 space-y-2 md:space-y-3 border-t border-border">
                  <div className="flex justify-between text-foreground text-xs md:text-base">
                    <span>Subtotal</span>
                    <span>₱{checkoutTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-lg">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg md:text-2xl">₱{checkoutTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="border-b border-border bg-muted/30 p-3 md:p-6">
                <CardTitle className="text-lg md:text-2xl">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-5 pt-3 md:pt-6 max-h-[70vh] overflow-y-auto p-3 md:p-6">
                <div>
                  <Label htmlFor="name" className="font-semibold text-foreground text-xs md:text-sm">Full Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1 md:mt-2 bg-background border-border h-9 md:h-11 text-xs md:text-sm"
                  />
                </div>

                {/* Saved Addresses Section */}
                {!loadingAddresses && savedAddresses.length > 0 && (
                  <div className="space-y-2 md:space-y-3 border-t pt-3 md:pt-4">
                    <Label className="font-semibold text-foreground flex items-center gap-2 text-xs md:text-sm">
                      <MapPin className="w-3 md:w-4 h-3 md:h-4" />
                      Your Saved Addresses
                    </Label>
                    <div className="space-y-1 md:space-y-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`w-full text-left p-2 md:p-3 rounded-lg border-2 transition-colors text-xs md:text-sm ${
                            useDefaultAddress && selectedAddressId === addr.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-xs md:text-sm truncate">{addr.full_name}</p>
                              <p className="text-xs text-muted-foreground">{addr.label}</p>
                              <p className="text-xs md:text-sm text-foreground mt-1">
                                {addr.street_address}, {addr.barangay}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {addr.city}, {addr.province} {addr.postal_code}
                              </p>
                            </div>
                            {addr.is_default && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex-shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseManualAddress}
                      className="w-full mt-1 md:mt-2 text-xs md:text-sm"
                    >
                      Use Different Address
                    </Button>
                  </div>
                )}

                {/* Manual Address Entry */}
                {(!useDefaultAddress || savedAddresses.length === 0) && (
                  <div className="space-y-2 md:space-y-4 border-t pt-3 md:pt-4">
                    <h3 className="font-semibold text-foreground text-xs md:text-sm">
                      {savedAddresses.length > 0 ? 'Or Enter Address Manually' : 'Enter Delivery Address'}
                    </h3>
                    
                    <div>
                      <Label htmlFor="phone" className="font-semibold text-foreground text-xs md:text-sm">Phone Number</Label>
                      <Input
                        id="phone"
                        value={addressForm.phone_number}
                        onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value.replace(/\D/g, '') })}
                        placeholder="09XXXXXXXXX"
                        type="text"
                        className="mt-1 md:mt-2 bg-background border-border h-9 md:h-11 text-xs md:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div>
                        <Label htmlFor="region" className="text-xs md:text-sm font-semibold">Region</Label>
                        <Input
                          id="region"
                          value={addressForm.region}
                          onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
                          placeholder="e.g., Metro Manila"
                          className="mt-1 bg-background border-border h-9 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province" className="text-xs md:text-sm font-semibold">Province</Label>
                        <Input
                          id="province"
                          value={addressForm.province}
                          onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                          placeholder="e.g., Metro Manila"
                          className="mt-1 bg-background border-border h-9 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div>
                        <Label htmlFor="city" className="text-xs md:text-sm font-semibold">City</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="e.g., Manila"
                          className="mt-1 bg-background border-border h-9 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="barangay" className="text-xs md:text-sm font-semibold">Barangay</Label>
                        <Input
                          id="barangay"
                          value={addressForm.barangay}
                          onChange={(e) => setAddressForm({ ...addressForm, barangay: e.target.value })}
                          placeholder="e.g., Binondo"
                          className="mt-1 bg-background border-border h-9 md:h-10 text-xs md:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="postal_code" className="text-xs md:text-sm font-semibold">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={addressForm.postal_code}
                        onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                        placeholder="1000"
                        className="mt-1 bg-background border-border h-9 md:h-10 text-xs md:text-sm"
                      />
                    </div>


                    <div>
                      <Label htmlFor="street" className="text-xs md:text-sm font-semibold">Street, Building, House No.</Label>
                      <Input
                        id="street"
                        value={addressForm.street_address}
                        onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                        placeholder="123 Main St"
                        className="mt-1 bg-background border-border h-9 md:h-10 text-xs md:text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-3 md:pt-4">
                  <Label htmlFor="payment" className="font-semibold text-foreground text-xs md:text-sm">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1 md:mt-2 bg-background border-border h-9 md:h-11 text-xs md:text-sm">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 md:h-12 mt-4 md:mt-6 text-xs md:text-sm"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Complete Order'}
                    <CheckCircle className="ml-1 md:ml-2 h-4 md:h-5 w-4 md:w-5" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

