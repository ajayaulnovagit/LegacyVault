import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Settings } from "lucide-react";
import { Link } from "wouter";

export default function WellbeingAlert() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const confirmWellbeingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wellbeing/confirm");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Well-being Confirmed",
        description: "Your check-in has been recorded and alert counter reset.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm well-being",
        variant: "destructive",
      });
    },
  });

  const getNextCheckIn = () => {
    if (!user?.lastCheckIn || !user?.wellbeingFrequency) return "Unknown";
    
    const lastCheckIn = new Date(user.lastCheckIn);
    const nextCheckIn = new Date(lastCheckIn.getTime() + (user.wellbeingFrequency * 60 * 60 * 1000));
    const now = new Date();
    
    if (nextCheckIn <= now) {
      return "Due now";
    }
    
    const hoursUntil = Math.ceil((nextCheckIn.getTime() - now.getTime()) / (1000 * 60 * 60));
    return `${hoursUntil} hours`;
  };

  if (!user) return null;

  return (
    <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Heart className="text-orange-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Well-being Check</h3>
              <p className="text-gray-600">Next check-in due in {getNextCheckIn()}</p>
              <p className="text-sm text-gray-500 mt-1">
                Alert frequency: Every {user.wellbeingFrequency} hours
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => confirmWellbeingMutation.mutate()}
              disabled={confirmWellbeingMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Heart className="mr-2 h-4 w-4" />
              I'm Okay
            </Button>
            <Link href="/wellbeing">
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Alert Counter:</span>
            <span className="font-medium text-gray-900">
              {user.alertCounter} / {user.maxAlerts} alerts sent
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
