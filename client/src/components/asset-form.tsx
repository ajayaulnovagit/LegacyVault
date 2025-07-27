import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Asset } from "@shared/schema";

interface AssetFormProps {
  asset?: Asset | null;
  onClose: () => void;
}

interface AssetFormData {
  type: string;
  name: string;
  value: string;
  accountNumber: string;
  description: string;
  storageLocation: string;
}

export default function AssetForm({ asset, onClose }: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    type: asset?.type || "",
    name: asset?.name || "",
    value: asset?.value || "",
    accountNumber: asset?.accountNumber || "",
    description: asset?.description || "",
    storageLocation: asset?.storageLocation || "local",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      await apiRequest("POST", "/api/assets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Success",
        description: "Asset added successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive",
      });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      await apiRequest("PUT", `/api/assets/${asset!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Success",
        description: "Asset updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update asset",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (asset) {
      updateAssetMutation.mutate(formData);
    } else {
      createAssetMutation.mutate(formData);
    }
  };

  const assetTypes = [
    { value: "bank_account", label: "Bank Account" },
    { value: "fixed_deposit", label: "Fixed Deposit" },
    { value: "property", label: "Property" },
    { value: "investment", label: "Investment" },
    { value: "cryptocurrency", label: "Cryptocurrency" },
    { value: "loan_given", label: "Loan Given" },
    { value: "insurance", label: "Insurance" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{asset ? "Edit Asset" : "Add New Asset"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="type">Asset Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter asset name"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="value">Current Value</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accountNumber">Account/Reference Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Enter account or reference number"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter any additional information about this asset..."
              rows={4}
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Storage Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label 
                className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  formData.storageLocation === 'gdrive' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="storage"
                  value="gdrive"
                  checked={formData.storageLocation === 'gdrive'}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <svg className="w-5 h-5 text-blue-600 mr-2 inline" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.5 2L3 6.5V18a2 2 0 002 2h14a2 2 0 002-2V6.5L17.5 2h-11z"/>
                  </svg>
                  <span className="font-medium">Google Drive</span>
                </div>
              </label>
              <label 
                className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  formData.storageLocation === 'digilocker' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="storage"
                  value="digilocker"
                  checked={formData.storageLocation === 'digilocker'}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <svg className="w-5 h-5 text-orange-600 mr-2 inline" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  </svg>
                  <span className="font-medium">DigiLocker</span>
                </div>
              </label>
              <label 
                className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  formData.storageLocation === 'local' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="storage"
                  value="local"
                  checked={formData.storageLocation === 'local'}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <svg className="w-5 h-5 text-gray-600 mr-2 inline" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                  </svg>
                  <span className="font-medium">Local Server</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAssetMutation.isPending || updateAssetMutation.isPending}
            >
              {asset ? "Update Asset" : "Save Asset"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
