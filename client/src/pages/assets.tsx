import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AssetForm from "@/components/asset-form";
import { Pencil, Trash2, Plus, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Asset } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function Assets() {
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["/api/assets"],
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteAssetMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const getAssetTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAssetIcon = (type: string) => {
    // You can expand this with more specific icons
    return <Building2 className="h-5 w-5 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <AssetForm 
            asset={editingAsset} 
            onClose={handleFormClose}
          />
        </div>
      )}

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your digital estate by adding your first asset.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <p className="text-sm text-gray-600">{getAssetTypeLabel(asset.type)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(asset)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(asset.id)}
                      disabled={deleteAssetMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {asset.value && (
                    <div>
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(parseFloat(asset.value))}
                      </p>
                    </div>
                  )}
                  {asset.accountNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Account</p>
                      <p className="text-sm font-mono text-gray-900">
                        ****{asset.accountNumber.slice(-4)}
                      </p>
                    </div>
                  )}
                  {asset.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {asset.description}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Storage: {asset.storageLocation}</span>
                    <span>Updated {new Date(asset.updatedAt!).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
