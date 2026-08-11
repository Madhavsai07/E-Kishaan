import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Leaf, Trophy, Settings, Edit, Save, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface UserData {
  name: string;
  location: string;
  district: string;
  landSize: string;
  primaryCrops: string[];
  experience: string;
  phone: string;
  email: string;
}

const achievements = [
  { id: 1, title: 'First Harvest', description: 'Completed your first crop cycle', icon: '🌾', earned: true },
  { id: 2, title: 'Soil Master', description: 'Maintained optimal soil health for 30 days', icon: '🌱', earned: true },
  { id: 3, title: 'Weather Warrior', description: 'Successfully predicted and prepared for weather changes', icon: '⛈️', earned: true },
  { id: 4, title: 'Profit Maximizer', description: 'Achieved 20%+ ROI in a season', icon: '💰', earned: true },
  { id: 5, title: 'Problem Solver', description: 'Solved 5 Frankenstein challenges', icon: '🧠', earned: true },
  { id: 6, title: 'Organic Champion', description: 'Transitioned to organic farming', icon: '🍃', earned: false },
  { id: 7, title: 'Tech Innovator', description: 'Used all platform features for 60 days', icon: '🚀', earned: false },
  { id: 8, title: 'Community Leader', description: 'Helped 10 other farmers', icon: '👥', earned: false },
];

const farmingStats = {
  totalSeasons: 8,
  avgROI: 24.5,
  bestYield: '3.2 tons/acre',
  problemsSolved: 12,
  daysActive: 156,
  carbonSaved: '2.4 tons CO2'
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { user: authUser, profile, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: 'Ravi Kumar',
    location: 'India',
    district: '',
    landSize: '4.0 acres',
    primaryCrops: ['Rice', 'Coconut', 'Pepper'],
    experience: '12 years',
    phone: '+91 9876543210',
    email: 'ravi.kumar@email.com'
  });

  const [editData, setEditData] = useState<UserData>(userData);

  // Once a real Supabase profile loads, replace the demo defaults with it.
  useEffect(() => {
    if (!profile && !authUser) return;
    setUserData((prev) => ({
      ...prev,
      name: profile?.name || prev.name,
      location: profile?.location || prev.location,
      landSize: profile?.land_size || prev.landSize,
      primaryCrops: profile?.primary_crops?.length ? profile.primary_crops : prev.primaryCrops,
      experience: profile?.experience || prev.experience,
      phone: profile?.phone || prev.phone,
      email: profile?.email || authUser?.email || prev.email,
    }));
  }, [profile, authUser]);

  // Keep the edit form's draft in sync with the source data while not editing.
  useEffect(() => {
    if (!isEditing) setEditData(userData);
  }, [userData, isEditing]);

  const initials = userData.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleEditToggle = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setEditData(userData);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (authUser) {
      setIsSaving(true);
      try {
        await updateProfile({
          name: editData.name,
          location: editData.location,
          land_size: editData.landSize,
          experience: editData.experience,
          phone: editData.phone,
        });
        toast.success('Profile updated.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save your profile.');
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not log out.');
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {userData.location}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{userData.experience} experience</Badge>
                  <Badge variant="secondary">{userData.landSize}</Badge>
                  <Badge className="bg-green-500">Level: Advanced Farmer</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleEditToggle}
              className="flex items-center gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm" disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? editData.name : userData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={isEditing ? editData.location : userData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={isEditing ? editData.district : userData.district}
                    onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={isEditing ? editData.phone : userData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={isEditing ? editData.email : userData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="landSize">Total Land Size</Label>
                  <Input
                    id="landSize"
                    value={isEditing ? editData.landSize : userData.landSize}
                    onChange={(e) => setEditData({ ...editData, landSize: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Farming Experience</Label>
                  <Input
                    id="experience"
                    value={isEditing ? editData.experience : userData.experience}
                    onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Farming Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Primary Crops</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userData.primaryCrops.map((crop, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Farming Method</h4>
                    <p className="text-sm text-blue-600 mt-1">Integrated Organic</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Irrigation Type</h4>
                    <p className="text-sm text-green-600 mt-1">Drip + Sprinkler</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800">Soil Type</h4>
                    <p className="text-sm text-orange-600 mt-1">Laterite + Alluvial</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achievements Earned ({earnedAchievements.length}/{achievements.length})
              </CardTitle>
              <CardDescription>Your farming and problem-solving milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{achievement.title}</h4>
                      <p className="text-sm text-green-600">{achievement.description}</p>
                    </div>
                    <Badge className="bg-green-500">Earned</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Achievements</CardTitle>
              <CardDescription>Goals to work towards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unearned.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-2xl opacity-50">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-700">{achievement.title}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                    <Badge variant="outline">Locked</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Farming Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Seasons</span>
                    <span className="font-medium">{farmingStats.totalSeasons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average ROI</span>
                    <span className="font-medium text-green-600">{farmingStats.avgROI}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Best Yield</span>
                    <span className="font-medium">{farmingStats.bestYield}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Days Active</span>
                    <span className="font-medium">{farmingStats.daysActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Problems Solved</span>
                    <span className="font-medium text-purple-600">{farmingStats.problemsSolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Points</span>
                    <span className="font-medium text-yellow-600">1,250</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Carbon Saved</span>
                    <span className="font-medium text-green-600">{farmingStats.carbonSaved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Water Saved</span>
                    <span className="font-medium text-blue-600">15,000 L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Organic Score</span>
                    <span className="font-medium text-emerald-600">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weather Alerts</h4>
                    <p className="text-sm text-gray-600">Receive notifications for weather changes</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Price Notifications</h4>
                    <p className="text-sm text-gray-600">Get alerts when crop prices change significantly</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Challenge Reminders</h4>
                    <p className="text-sm text-gray-600">Daily reminders for Frankenstein challenges</p>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-gray-600">Share anonymized data to improve AI models</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Export My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Reset Progress
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}