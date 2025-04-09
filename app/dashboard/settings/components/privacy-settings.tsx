"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/login/components/auth-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Lock, ShieldCheck } from "lucide-react";
import { DigiLockerVerifyButton } from "@/components/digilocker-verify-button";
import { Separator } from "@/components/ui/separator";

export function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAdultContent, setShowAdultContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDigiLockerVerified, setIsDigiLockerVerified] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAdultContentPreference();
      checkDigiLockerStatus();
    }
  }, [user]);

  const checkDigiLockerStatus = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/auth/digilocker/verify?userId=${user.id}`);
      const data = await response.json();
      setIsDigiLockerVerified(data.verified);
    } catch (error) {
      console.error('Error checking DigiLocker status:', error);
    }
  };

  const fetchAdultContentPreference = async () => {
    try {
      const response = await fetch(`/api/settings/adult-content?userId=${user?.phoneNumber}`);
      const data = await response.json();
      if (response.ok) {
        setShowAdultContent(data.showAdultContent);
      }
    } catch (error) {
      console.error('Error fetching adult content preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdultContentToggle = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to change settings",
      });
      return;
    }

    // Require DigiLocker verification for adult content
    if (!isDigiLockerVerified && !showAdultContent) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please verify your age through DigiLocker first",
      });
      return;
    }

    try {
      const response = await fetch('/api/settings/adult-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.phoneNumber,
          showAdultContent: !showAdultContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      setShowAdultContent(!showAdultContent);
      toast({
        title: "Success",
        description: "Adult content preferences updated",
      });
    } catch (error) {
      console.error('Error updating adult content preference:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preferences",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Manage your privacy and content preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ShieldCheck className={`h-5 w-5 ${isDigiLockerVerified ? 'text-green-500' : 'text-gray-400'}`} />
            <div className="flex-grow space-y-1">
              <Label>Age Verification</Label>
              <p className="text-sm text-muted-foreground">
                Verify your age through DigiLocker to access adult content
              </p>
            </div>
            <DigiLockerVerifyButton
              userId={user?.id || ''}
              onVerified={() => setIsDigiLockerVerified(true)}
              size="sm"
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label>Show Adult Content (18+)</Label>
            <p className="text-sm text-muted-foreground">
              {isDigiLockerVerified 
                ? "Enable to view adult content in stories and posts"
                : "Verify your age first to enable adult content"}
            </p>
          </div>
          <Switch
            checked={showAdultContent}
            onCheckedChange={handleAdultContentToggle}
            disabled={isLoading || !isDigiLockerVerified}
          />
        </div>
      </CardContent>
    </Card>
  );
}
