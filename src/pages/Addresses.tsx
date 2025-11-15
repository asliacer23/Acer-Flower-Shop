import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { addressService } from '@/services/addresses';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/types';
import { Trash2, Edit2, MapPin, Plus } from 'lucide-react';

// Philippine regions, provinces, cities, and barangays data
const PHILIPPINES_DATA = {
  'Metro Manila': {
    'Metro Manila': {
      'Manila': ['Binondo', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 'San Nicolas', 'Santa Ana', 'Santo Domingo', 'Tondo'],
      'Quezon City': ['Araneta Center', 'Balete', 'Bagbag', 'Balintawak', 'Batasan Hills', 'Bayan', 'Commonwealth', 'Cubao', 'Diliman', 'East Rembo', 'Fairview', 'Galas', 'Manresa', 'Marikina Heights', 'Matandang Balara', 'Maybunga', 'Muñoz', 'New Manila', 'North Triangle', 'Pag-asa', 'Payatas', 'Pengson', 'Project 3', 'Project 4', 'Project 6', 'Project 8', 'Sabang', 'Sacred Heart', 'Salvacion', 'San Antonio', 'San Bartolome', 'San Isidro', 'Santa Cruz', 'Santa Lucia', 'Santa Monica', 'Santo Domingo', 'South Triangle', 'Tatalon', 'Thilomar', 'Ugong', 'UP Hill', 'Veterans Village'],
      'Caloocan': ['Amparo', 'Bagong Barrio', 'Caloocan', 'Casimiro', 'Catmon', 'Deparo', 'Dona Fausta', 'Dona Josefa', 'Dona Mercedes', 'Dona Natividad', 'East Caloocan', 'Goldloop', 'Gregorio Araneta Avenue', 'Kalookan North', 'Kalookan South', 'Kaybiga', 'Kaunlaran Village', 'Liberation', 'Limay', 'Linao', 'Longos', 'Malabong', 'Malanday', 'Manggahan', 'Maunlad', 'Monumento', 'Nonabon', 'North Caloocan', 'Obrero', 'PAHIYAS', 'Pag-asa', 'Pagasa', 'Palangian', 'Pangarap Village', 'Paraiso', 'Pateros', 'Peace Valley', 'Pilipit', 'Pinyahan', 'Polo', 'Pulo', 'Pusong Pampasaya', 'Roxas', 'Rumulin', 'Salvacion', 'San Martin de Porres', 'Sangandaan', 'Santa Agueda', 'Santa Bartolome', 'Santa Cruz', 'Santa Maria', 'Santa Monica', 'Sapang Palay', 'Tala', 'Talayan', 'Talipapa', 'Tangos North', 'Tangos South', 'Tatalon', 'Tinajeros', 'Tondo', 'Tipas', 'Ugong', 'Unang Sigalot', 'Vargas Village', 'Vaugh', 'Villa Nueva', 'Villancentenario', 'West Caloocan', 'West Rembo', 'Westside', 'Zabarte'],
    },
  },
  'Mindanao': {
    'Davao del Sur': {
      'Davao City': ['Agdao', 'Bago Gallera', 'Bajada', 'Bunawan', 'Calinan', 'Catigan', 'Gatigan', 'Gumalang', 'Ilang', 'Langilan', 'Magtuod', 'Mahayag', 'Malabog', 'Malalag', 'Marinao', 'Matina', 'Matina Crossing', 'Matina Pangi', 'Monkayo', 'Mumubo', 'Nabua', 'Pag-asa', 'Pakracoon', 'Panabo', 'Panacan', 'Paquibato', 'Pareña', 'Penaplata', 'Picacho', 'Pieta', 'Punta Alma', 'Samal', 'San Antonio', 'Sibulan', 'Sasa', 'Talomo', 'Talosa', 'Tamugan', 'Tibungco'],
    },
  },
  'Luzon': {
    'NCR East': {
      'Taytay': ['Bambang', 'Kapitangan', 'Libjo', 'Novaliches', 'Platero', 'San Juan', 'Santa Cruz'],
      'Cainta': ['Bayan', 'Binong', 'Buli', 'Calwa', 'Cayumba', 'Doña Rosa', 'Hinulugang Taktak', 'Ilog', 'Kalsada', 'Kanluran', 'Karangalan', 'Lumampong', 'Pag-asa', 'Palsiguran', 'Platero', 'San Juan', 'Santo Domingo', 'Sumaca', 'Timugan'],
    },
  },
};

interface AddressFormData {
  full_name: string;
  phone_number: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  postal_code: string;
  street_address: string;
  label: string;
  is_default: boolean;
}

export default function Addresses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);

  const [formData, setFormData] = useState<AddressFormData>({
    full_name: '',
    phone_number: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    postal_code: '',
    street_address: '',
    label: 'Home',
    is_default: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load addresses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (region: string) => {
    setFormData(prev => ({
      ...prev,
      region,
      province: '',
      city: '',
      barangay: '',
    }));
    const regionData = PHILIPPINES_DATA[region as keyof typeof PHILIPPINES_DATA];
    setProvinces(Object.keys(regionData || {}));
    setCities([]);
    setBarangays([]);
  };

  const handleProvinceChange = (province: string) => {
    setFormData(prev => ({
      ...prev,
      province,
      city: '',
      barangay: '',
    }));
    const provinceData = PHILIPPINES_DATA[formData.region as keyof typeof PHILIPPINES_DATA]?.[province as keyof typeof PHILIPPINES_DATA[keyof typeof PHILIPPINES_DATA]];
    setCities(Object.keys(provinceData || {}));
    setBarangays([]);
  };

  const handleCityChange = (city: string) => {
    setFormData(prev => ({
      ...prev,
      city,
      barangay: '',
    }));
    const cityData = PHILIPPINES_DATA[formData.region as keyof typeof PHILIPPINES_DATA]?.[formData.province as keyof typeof PHILIPPINES_DATA[keyof typeof PHILIPPINES_DATA]]?.[city as keyof any];
    setBarangays(cityData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.phone_number || !formData.region || 
        !formData.province || !formData.city || !formData.barangay || 
        !formData.postal_code || !formData.street_address) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        await addressService.updateAddress(editingId, formData);
        toast({
          title: 'Success',
          description: 'Address updated successfully',
        });
      } else {
        await addressService.createAddress(formData);
        toast({
          title: 'Success',
          description: 'Address added successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({
        full_name: '',
        phone_number: '',
        region: '',
        province: '',
        city: '',
        barangay: '',
        postal_code: '',
        street_address: '',
        label: 'Home',
        is_default: false,
      });
      await fetchAddresses();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingId ? 'Failed to update address' : 'Failed to add address',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      full_name: address.full_name,
      phone_number: address.phone_number,
      region: address.region,
      province: address.province,
      city: address.city,
      barangay: address.barangay,
      postal_code: address.postal_code,
      street_address: address.street_address,
      label: address.label,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    handleRegionChange(address.region);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await addressService.deleteAddress(id);
        toast({
          title: 'Success',
          description: 'Address deleted successfully',
        });
        await fetchAddresses();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete address',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      toast({
        title: 'Success',
        description: 'Default address updated',
      });
      await fetchAddresses();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set default address',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Addresses</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    full_name: '',
                    phone_number: '',
                    region: '',
                    province: '',
                    city: '',
                    barangay: '',
                    postal_code: '',
                    street_address: '',
                    label: 'Home',
                    is_default: false,
                  });
                  setProvinces([]);
                  setCities([]);
                  setBarangays([]);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update your delivery address' : 'Add a new delivery address'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      full_name: e.target.value,
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    placeholder="09XXXXXXXXX"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      phone_number: e.target.value.replace(/\D/g, ''),
                    }))}
                    type="tel"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">10-11 digits</p>
                </div>

                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={handleRegionChange}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PHILIPPINES_DATA).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.region && provinces.length > 0 && (
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Select value={formData.province} onValueChange={handleProvinceChange}>
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Select Province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.province && cities.length > 0 && (
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select value={formData.city} onValueChange={handleCityChange}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.city && barangays.length > 0 && (
                  <div>
                    <Label htmlFor="barangay">Barangay</Label>
                    <Select value={formData.barangay} onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      barangay: value,
                    }))}>
                      <SelectTrigger id="barangay">
                        <SelectValue placeholder="Select Barangay" />
                      </SelectTrigger>
                      <SelectContent>
                        {barangays.map((barangay) => (
                          <SelectItem key={barangay} value={barangay}>
                            {barangay}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    placeholder="e.g., 1200"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      postal_code: e.target.value,
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="street_address">Street Name, Building, House No.</Label>
                  <Input
                    id="street_address"
                    placeholder="Enter street address details"
                    value={formData.street_address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      street_address: e.target.value,
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="label">Label As</Label>
                  <Select value={formData.label} onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    label: value,
                  }))}>
                    <SelectTrigger id="label">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? 'Update Address' : 'Add Address'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No addresses added yet</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Your First Address</Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{address.full_name}</h3>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        {address.label}
                      </span>
                      {address.is_default && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{address.phone_number}</p>
                    <p className="text-sm">
                      {address.street_address}
                    </p>
                    <p className="text-sm">
                      {address.barangay}, {address.city}, {address.province}, {address.region}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Postal Code: {address.postal_code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>

                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="w-full"
                  >
                    Set as Default Address
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
