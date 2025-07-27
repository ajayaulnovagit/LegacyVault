import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Nominee } from "@shared/schema";

interface NomineeFormData {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export default function Nominees() {
  const [showForm, setShowForm] = useState(false);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [formData, setFormData] = useState<NomineeFormData>({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    isPrimary: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ["/api/nominees"],
  });

  const createNomineeMutation = useMutation({
    mutationFn: async (data: NomineeFormData) => {
      await apiRequest("POST", "/api/nominees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nominees"] });
      toast({
        title: "Success",
        description: "Emergency contact added successfully",
      });
      resetForm();
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
        description: "Failed to add emergency contact",
        variant: "destructive",
      });
    },
  });

  const updateNomineeMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<NomineeFormData>) => {
      const { id, ...updateData } = data;
      await apiRequest("PUT", `/api/nominees/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nominees"] });
      toast({
        title: "Success",
        description: "Emergency contact updated successfully",
      });
      resetForm();
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
        description: "Failed to update emergency contact",
        variant: "destructive",
      });
    },
  });

  const deleteNomineeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/nominees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nominees"] });
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully",
      });
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
        description: "Failed to delete emergency contact",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      relationship: "",
      isPrimary: false,
    });
    setEditingNominee(null);
    setShowForm(false);
  };

  const handleEdit = (nominee: Nominee) => {
    setFormData({
      name: nominee.name,
      email: nominee.email,
      phone: nominee.phone || "",
      relationship: nominee.relationship,
      isPrimary: nominee.isPrimary,
    });
    setEditingNominee(nominee);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this emergency contact?")) {
      deleteNomineeMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNominee) {
      updateNomineeMutation.mutate({
        id: editingNominee.id,
        ...formData,
      });
    } else {
      createNomineeMutation.mutate(formData);
    }
  };

  const primaryNominees = nominees.filter(n => n.isPrimary);
  const secondaryNominees = nominees.filter(n => !n.isPrimary);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingNominee ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                />
                <Label htmlFor="isPrimary">Primary Contact</Label>
                <span className="text-sm text-gray-500">
                  (Primary contacts are notified first in emergencies)
                </span>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={createNomineeMutation.isPending || updateNomineeMutation.isPending}>
                  {editingNominee ? "Update Contact" : "Add Contact"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {nominees.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency contacts yet</h3>
              <p className="text-gray-600 mb-6">
                Add trusted family members or friends who should be notified in case of emergency.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Primary Contacts */}
          {primaryNominees.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary Contacts</h2>
              <div className="space-y-3">
                {primaryNominees.map((nominee) => (
                  <Card key={nominee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {nominee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{nominee.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{nominee.relationship}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span>{nominee.email}</span>
                              </div>
                              {nominee.phone && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{nominee.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Primary
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(nominee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(nominee.id)}
                            disabled={deleteNomineeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Contacts */}
          {secondaryNominees.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Secondary Contacts</h2>
              <div className="space-y-3">
                {secondaryNominees.map((nominee) => (
                  <Card key={nominee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {nominee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{nominee.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{nominee.relationship}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span>{nominee.email}</span>
                              </div>
                              {nominee.phone && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{nominee.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Secondary
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(nominee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(nominee.id)}
                            disabled={deleteNomineeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
