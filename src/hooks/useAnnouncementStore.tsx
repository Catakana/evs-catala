
import { create } from 'zustand';
import { Announcement, AnnouncementViewMode, AnnouncementCategory } from '@/types/announcement';

interface AnnouncementStore {
  announcements: Announcement[];
  searchTerm: string;
  viewMode: AnnouncementViewMode;
  selectedCategories: AnnouncementCategory[];
  selectedAnnouncement: Announcement | null;
  showDetailModal: boolean;
  showCreateModal: boolean;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: AnnouncementViewMode) => void;
  toggleCategory: (category: string) => void;
  selectAnnouncement: (announcement: Announcement) => void;
  closeDetailModal: () => void;
  setShowCreateModal: (show: boolean) => void;
  closeCreateModal: () => void;
  addAnnouncement: (announcement: Announcement) => void;
  
  // Computed
  filteredAnnouncements: Announcement[];
}

// Mock data for announcements
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Fermeture exceptionnelle du local',
    content: 'En raison de travaux de maintenance, le local sera fermé le vendredi 23 mai. Nous vous prions de nous excuser pour la gêne occasionnée.',
    category: 'info',
    authorId: 'user-1',
    authorName: 'Marie Dubois',
    publishDate: new Date('2025-05-15'),
    isArchived: false,
    createdAt: new Date('2025-05-15'),
  },
  {
    id: '2',
    title: 'URGENT: Appel aux bénévoles pour l\'événement du 30 mai',
    content: 'Nous recherchons 5 bénévoles supplémentaires pour aider lors de l\'événement du 30 mai. Merci de vous manifester au plus vite si vous êtes disponible.',
    category: 'urgent',
    authorId: 'user-2',
    authorName: 'Thomas Martin',
    publishDate: new Date('2025-05-18'),
    isArchived: false,
    createdAt: new Date('2025-05-18'),
    attachments: ['planning-30-mai.pdf']
  },
  {
    id: '3',
    title: 'Proposition de nouveau projet culturel',
    content: 'Un nouveau projet culturel est proposé par l\'équipe d\'animation. Vous trouverez en pièce jointe le dossier complet. Merci de donner votre avis lors de la prochaine réunion.',
    category: 'project',
    authorId: 'user-3',
    authorName: 'Sophie Moreau',
    publishDate: new Date('2025-05-10'),
    isArchived: false,
    createdAt: new Date('2025-05-10'),
    attachments: ['projet-culturel-2025.pdf', 'budget-previsionnel.xlsx']
  },
  {
    id: '4',
    title: 'Rappel: Fête de quartier le 5 juin',
    content: 'Nous vous rappelons que la fête de quartier aura lieu le 5 juin à partir de 14h. Toutes les informations pratiques sont dans la pièce jointe.',
    category: 'event',
    authorId: 'user-1',
    authorName: 'Marie Dubois',
    publishDate: new Date('2025-05-19'),
    expireDate: new Date('2025-06-05'),
    isArchived: false,
    createdAt: new Date('2025-05-19'),
    attachments: ['programme-fete-quartier.pdf']
  }
];

export const useAnnouncementStore = create<AnnouncementStore>()((set, get) => ({
  announcements: mockAnnouncements,
  searchTerm: '',
  viewMode: 'grid',
  selectedCategories: [],
  selectedAnnouncement: null,
  showDetailModal: false,
  showCreateModal: false,
  
  // Actions
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  
  setViewMode: (mode: AnnouncementViewMode) => set({ viewMode: mode }),
  
  toggleCategory: (category: string) => set((state) => {
    const categories = state.selectedCategories as string[];
    if (categories.includes(category)) {
      return { selectedCategories: categories.filter(c => c !== category) as AnnouncementCategory[] };
    } else {
      return { selectedCategories: [...categories, category] as AnnouncementCategory[] };
    }
  }),
  
  selectAnnouncement: (announcement: Announcement) => set({ 
    selectedAnnouncement: announcement,
    showDetailModal: true
  }),
  
  closeDetailModal: () => set({ showDetailModal: false }),
  
  setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
  
  closeCreateModal: () => set({ showCreateModal: false }),
  
  addAnnouncement: (announcement: Announcement) => set((state) => ({
    announcements: [announcement, ...state.announcements]
  })),
  
  // Computed
  get filteredAnnouncements() {
    const { announcements, searchTerm, selectedCategories } = get();
    
    return announcements
      .filter(a => !a.isArchived)
      .filter(a => {
        if (searchTerm === '') return true;
        return (
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .filter(a => {
        if (selectedCategories.length === 0) return true;
        return selectedCategories.includes(a.category as AnnouncementCategory);
      })
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }
}));
