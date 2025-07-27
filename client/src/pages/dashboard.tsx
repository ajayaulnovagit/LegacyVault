import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import WellbeingAlert from "@/components/wellbeing-alert";
import { 
  Building2, 
  Coins, 
  Home, 
  University, 
  Plus,
  Download,
  UserPlus,
  Banknote,
  Bitcoin
} from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: assets = [] } = useQuery({
    queryKey: ["/api/assets"],
  });

  const { data: nominees = [] } = useQuery({
    queryKey: ["/api/nominees"],
  });

  // Calculate asset statistics
  const assetStats = {
    bankAccounts: assets.filter(a => a.type === 'bank_account').length,
    properties: assets.filter(a => a.type === 'property').length,
    investments: assets.filter(a => a.type === 'investment').length,
    crypto: assets.filter(a => a.type === 'cryptocurrency').length,
  };

  const recentAssets = assets.slice(0, 3);
  const primaryNominees = nominees.filter(n => n.isPrimary);
  const secondaryNominees = nominees.filter(n => !n.isPrimary).slice(0, 1);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return <University className="text-primary" />;
      case 'property':
        return <Home className="text-green-600" />;
      case 'investment':
        return <Coins className="text-yellow-600" />;
      case 'cryptocurrency':
        return <Bitcoin className="text-purple-600" />;
      default:
        return <Banknote className="text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Well-being Alert */}
      <WellbeingAlert />

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Asset Overview</CardTitle>
                <Link href="/assets">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Asset Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <University className="text-primary text-2xl mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-gray-900">{assetStats.bankAccounts}</div>
                  <div className="text-sm text-gray-600">Bank Accounts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Home className="text-green-600 text-2xl mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-gray-900">{assetStats.properties}</div>
                  <div className="text-sm text-gray-600">Properties</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Coins className="text-yellow-600 text-2xl mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-gray-900">{assetStats.investments}</div>
                  <div className="text-sm text-gray-600">Investments</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Bitcoin className="text-purple-600 text-2xl mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-gray-900">{assetStats.crypto}</div>
                  <div className="text-sm text-gray-600">Crypto Assets</div>
                </div>
              </div>

              {/* Recent Assets */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Recent Assets</h3>
                {recentAssets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No assets added yet</p>
                    <Link href="/assets">
                      <Button variant="outline" className="mt-2">
                        Add Your First Asset
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{asset.name}</div>
                          <div className="text-sm text-gray-600">
                            {asset.accountNumber ? `Account #****${asset.accountNumber.slice(-4)}` : asset.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {asset.value && (
                          <div className="font-medium text-gray-900">
                            {formatCurrency(parseFloat(asset.value))}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {new Date(asset.updatedAt!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Storage Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 border rounded-lg ${
                  user?.storagePreference === 'gdrive' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.5 2L3 6.5V18a2 2 0 002 2h14a2 2 0 002-2V6.5L17.5 2h-11z"/>
                    </svg>
                    <span className="font-medium text-gray-900">Google Drive</span>
                  </div>
                  {user?.storagePreference === 'gdrive' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Active</span>
                    </div>
                  )}
                </div>
                <div className={`flex items-center justify-between p-3 border rounded-lg ${
                  user?.storagePreference === 'digilocker' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    </svg>
                    <span className="font-medium text-gray-900">DigiLocker</span>
                  </div>
                  {user?.storagePreference === 'digilocker' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Active</span>
                    </div>
                  )}
                </div>
                <div className={`flex items-center justify-between p-3 border rounded-lg ${
                  user?.storagePreference === 'local' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                    </svg>
                    <span className="font-medium text-gray-900">Local Server</span>
                  </div>
                  {user?.storagePreference === 'local' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                <Link href="/nominees">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...primaryNominees, ...secondaryNominees].length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No emergency contacts added</p>
                    <Link href="/nominees">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Contact
                      </Button>
                    </Link>
                  </div>
                ) : (
                  [...primaryNominees, ...secondaryNominees].map((nominee) => (
                    <div key={nominee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {nominee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{nominee.name}</div>
                        <div className="text-sm text-gray-600">{nominee.relationship}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        nominee.isPrimary 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {nominee.isPrimary ? 'Primary' : 'Secondary'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/assets">
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="mr-3 h-4 w-4 text-primary" />
                    Add New Asset
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="mr-3 h-4 w-4 text-green-600" />
                  Export Data
                </Button>
                <Link href="/nominees">
                  <Button variant="ghost" className="w-full justify-start">
                    <UserPlus className="mr-3 h-4 w-4 text-yellow-600" />
                    Add Nominee
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
