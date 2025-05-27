import React, { useState, useEffect } from 'react';
import { ProjectMember } from '@/types/project';
import { projectService } from '@/lib/projectService';
import { userService, UserProfile } from '@/lib/userService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Crown,
  User,
  Settings
} from 'lucide-react';

interface ProjectTeamManagerProps {
  projectId: string;
  members: ProjectMember[];
  currentUserId: string;
  isUserAdmin: boolean;
  onMembersUpdate: () => void;
}

interface MemberWithProfile extends ProjectMember {
  profile?: UserProfile;
}

const ProjectTeamManager: React.FC<ProjectTeamManagerProps> = ({
  projectId,
  members,
  currentUserId,
  isUserAdmin,
  onMembersUpdate
}) => {
  const [membersWithProfiles, setMembersWithProfiles] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembersWithProfiles();
  }, [members]);

  const loadMembersWithProfiles = async () => {
    try {
      setLoading(true);
      console.log('👥 Chargement des profils des membres...');

      const userIds = members.map(member => member.userId);
      const profiles = await userService.getUsersByIds(userIds);

      const membersWithProfiles = members.map(member => {
        const profile = profiles.find(p => p.id === member.userId);
        return {
          ...member,
          profile
        };
      });

      setMembersWithProfiles(membersWithProfiles);
      console.log('✅ Profils des membres chargés');

    } catch (error) {
      console.error('❌ Erreur lors du chargement des profils:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations des membres.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await userService.searchUsers(query);
      // Filtrer les utilisateurs déjà membres
      const existingMemberIds = members.map(m => m.userId);
      const filteredResults = results.filter(user => !existingMemberIds.includes(user.id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      console.log('➕ Ajout d\'un membre au projet:', selectedUser.id, selectedRole);

      await projectService.addProjectMember(projectId, selectedUser.id, selectedRole);
      
      toast({
        title: 'Succès',
        description: `${userService.formatUserName(selectedUser)} a été ajouté à l'équipe.`,
      });

      // Reset form
      setSelectedUser(null);
      setSelectedRole('member');
      setSearchQuery('');
      setSearchResults([]);
      setAddMemberOpen(false);
      
      // Refresh members
      onMembersUpdate();

    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du membre:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le membre à l\'équipe.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember) return;

    try {
      setActionLoading(true);
      console.log('✏️ Modification du rôle du membre:', selectedMember.id, selectedRole);

      await projectService.updateProjectMemberRole(selectedMember.id, selectedRole);
      
      toast({
        title: 'Succès',
        description: 'Le rôle du membre a été mis à jour.',
      });

      // Reset form
      setSelectedMember(null);
      setSelectedRole('member');
      setEditMemberOpen(false);
      
      // Refresh members
      onMembersUpdate();

    } catch (error) {
      console.error('❌ Erreur lors de la modification du rôle:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le rôle du membre.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (member: MemberWithProfile) => {
    try {
      setActionLoading(true);
      console.log('🗑️ Suppression du membre:', member.id);

      await projectService.removeProjectMember(member.id);
      
      toast({
        title: 'Succès',
        description: `${member.profile ? userService.formatUserName(member.profile) : 'Le membre'} a été retiré de l'équipe.`,
      });
      
      // Refresh members
      onMembersUpdate();

    } catch (error) {
      console.error('❌ Erreur lors de la suppression du membre:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le membre de l\'équipe.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'manager':
        return <Settings className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrateur',
      manager: 'Gestionnaire',
      member: 'Membre',
      contributor: 'Contributeur'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'manager':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'contributor':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Équipe</h3>
          {isUserAdmin && (
            <Button disabled size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Équipe ({membersWithProfiles.length} membre{membersWithProfiles.length > 1 ? 's' : ''})</h3>
        {isUserAdmin && (
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
                <DialogDescription>
                  Recherchez et sélectionnez un utilisateur à ajouter au projet.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Rechercher un utilisateur</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nom, prénom ou email..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map(user => (
                      <Card 
                        key={user.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedUser?.id === user.id ? 'ring-2 ring-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {userService.getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{userService.formatUserName(user)}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membre</SelectItem>
                        <SelectItem value="contributor">Contributeur</SelectItem>
                        <SelectItem value="manager">Gestionnaire</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddMember} 
                  disabled={!selectedUser || actionLoading}
                >
                  {actionLoading ? 'Ajout...' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {membersWithProfiles.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/50">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium">Aucun membre</h4>
          <p className="text-muted-foreground mt-2">
            Ce projet n'a pas encore de membres assignés.
          </p>
          {isUserAdmin && (
            <Button className="mt-4" onClick={() => setAddMemberOpen(true)}>
              Ajouter le premier membre
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {membersWithProfiles.map(member => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profile?.avatar_url} />
                      <AvatarFallback>
                        {member.profile ? userService.getUserInitials(member.profile) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.profile ? userService.formatUserName(member.profile) : member.userId}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {isUserAdmin && member.userId !== currentUserId && (
                    <div className="flex space-x-1">
                      <Dialog open={editMemberOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                        setEditMemberOpen(open);
                        if (open) {
                          setSelectedMember(member);
                          setSelectedRole(member.role);
                        } else {
                          setSelectedMember(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le rôle</DialogTitle>
                            <DialogDescription>
                              Modifier le rôle de {member.profile ? userService.formatUserName(member.profile) : member.userId}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-role">Nouveau rôle</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Membre</SelectItem>
                                <SelectItem value="contributor">Contributeur</SelectItem>
                                <SelectItem value="manager">Gestionnaire</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditMemberOpen(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleUpdateMemberRole} disabled={actionLoading}>
                              {actionLoading ? 'Modification...' : 'Modifier'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retirer de l'équipe</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir retirer {member.profile ? userService.formatUserName(member.profile) : member.userId} de l'équipe du projet ?
                              Cette action ne peut pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveMember(member)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Retirer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTeamManager; 