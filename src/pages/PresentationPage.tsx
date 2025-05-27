import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Vote, 
  FolderOpen, 
  Bell, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Star,
  Heart,
  Zap,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Composant pour les sections avec animation d'apparition
const AnimatedSection: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Composant pour les fonctionnalités avec illustration
const FeatureSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  illustration: React.ReactNode;
  reverse?: boolean;
}> = ({ icon, title, description, features, gradient, illustration, reverse = false }) => {
  return (
    <AnimatedSection>
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20",
        reverse ? "lg:grid-flow-col-dense" : ""
      )}>
        {/* Contenu textuel */}
        <div className={cn("space-y-8", reverse ? "lg:col-start-2" : "")}>
          <div className="flex items-center gap-4">
            <div className={cn("p-4 rounded-2xl text-white", gradient)}>
              {icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-lg text-gray-600 mt-2">{description}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-lg">{feature}</span>
              </motion.div>
            ))}
          </div>
          
          <Button 
            size="lg" 
            className={cn("text-white shadow-lg hover:shadow-xl transition-all", gradient)}
          >
            Découvrir {title}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Illustration */}
        <div className={cn("", reverse ? "lg:col-start-1" : "")}>
          <Card className="overflow-hidden border-0 shadow-2xl">
            <CardContent className="p-0">
              {illustration}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Composant d'illustration pour chaque fonctionnalité
const CalendarIllustration = () => (
  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Mai 2025</h3>
        <Calendar className="h-6 w-6" />
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div key={i} className="font-medium opacity-70">{day}</div>
        ))}
        {Array.from({ length: 31 }, (_, i) => (
          <div key={i} className={cn(
            "h-8 w-8 rounded flex items-center justify-center text-xs",
            i === 14 ? "bg-yellow-400 text-blue-900 font-bold" : 
            i === 20 ? "bg-white/20" : ""
          )}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>Réunion équipe</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-white/20 rounded"></div>
          <span>Animation jeunes</span>
        </div>
      </div>
    </div>
  </div>
);

const PermanencesIllustration = () => (
  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="h-6 w-6" />
        Planning Permanences
      </h3>
      <div className="space-y-3">
        {[
          { day: 'Lundi', time: '14h-17h', person: 'Marie D.', status: 'confirmed' },
          { day: 'Mercredi', time: '9h-12h', person: 'Jean P.', status: 'confirmed' },
          { day: 'Vendredi', time: '14h-17h', person: 'Libre', status: 'available' },
          { day: 'Samedi', time: '10h-13h', person: 'Sophie L.', status: 'confirmed' }
        ].map((slot, i) => (
          <div key={i} className="flex items-center justify-between bg-white/10 rounded p-3">
            <div>
              <div className="font-medium">{slot.day}</div>
              <div className="text-sm opacity-80">{slot.time}</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              slot.status === 'confirmed' ? "bg-green-400 text-green-900" :
              "bg-yellow-400 text-yellow-900"
            )}>
              {slot.person}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VotesIllustration = () => (
  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Vote className="h-6 w-6" />
        Vote en cours
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Choix du lieu pour la prochaine sortie ?</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/10 rounded p-2">
              <span>Parc de la Tête d'Or</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-yellow-400"></div>
                </div>
                <span className="text-sm">12</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/10 rounded p-2">
              <span>Musée des Confluences</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-yellow-400"></div>
                </div>
                <span className="text-sm">8</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <Button size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
            Voter maintenant
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const ProjectsIllustration = () => (
  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FolderOpen className="h-6 w-6" />
        Projet Festival d'été
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-80">Budget</div>
            <div className="font-bold text-lg">2 500€</div>
          </div>
          <div>
            <div className="opacity-80">Équipe</div>
            <div className="font-bold text-lg">8 membres</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Progression</span>
            <span className="text-sm">65%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-yellow-400"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Réservation lieu</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Contact artistes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-4 border-2 border-white/40 rounded"></div>
            <span>Communication</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AnnouncesIllustration = () => (
  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Bell className="h-6 w-6" />
        Dernières annonces
      </h3>
      <div className="space-y-3">
        {[
          { title: 'Assemblée générale', time: 'Il y a 2h', priority: 'high' },
          { title: 'Nouvelle adhésion', time: 'Il y a 1j', priority: 'normal' },
          { title: 'Rappel permanences', time: 'Il y a 2j', priority: 'normal' }
        ].map((announce, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/10 rounded p-3">
            <div className={cn(
              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
              announce.priority === 'high' ? "bg-red-400" : "bg-green-400"
            )}></div>
            <div className="flex-1">
              <div className="font-medium">{announce.title}</div>
              <div className="text-sm opacity-80">{announce.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MessagesIllustration = () => (
  <div className="bg-gradient-to-br from-teal-500 to-green-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Conversations
      </h3>
      <div className="space-y-3">
        {[
          { name: 'Équipe Communication', message: 'Prêt pour la réunion ?', time: '14:30', unread: 2 },
          { name: 'Marie Dupont', message: 'Merci pour les infos !', time: '12:15', unread: 0 },
          { name: 'Groupe Événements', message: 'Photos du festival', time: 'Hier', unread: 5 }
        ].map((conv, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 rounded p-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{conv.name}</div>
              <div className="text-sm opacity-80 truncate">{conv.message}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">{conv.time}</div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-red-400 text-red-900 rounded-full text-xs flex items-center justify-center mt-1">
                  {conv.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TrombinoscopeIllustration = () => (
  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white">
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="h-6 w-6" />
        Membres de l'association
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Marie D.', role: 'Présidente' },
          { name: 'Jean P.', role: 'Trésorier' },
          { name: 'Sophie L.', role: 'Secrétaire' },
          { name: 'Alex M.', role: 'Membre' }
        ].map((member, i) => (
          <div key={i} className="bg-white/10 rounded p-3 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div className="font-medium text-sm">{member.name}</div>
            <div className="text-xs opacity-80">{member.role}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PresentationPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  
  // Transformations parallax
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fond animé */}
        <motion.div 
          className="absolute inset-0 -z-10"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          
          {/* Formes géométriques animées */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </motion.div>

        {/* Contenu Hero */}
        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="inline-block mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                ✨ Portail Associatif Moderne
              </Badge>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">EVS CATALA</span>
              <motion.span 
                className="block text-4xl md:text-5xl text-yellow-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Votre association connectée
              </motion.span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
              Une plateforme complète pour gérer, organiser et faire vivre votre association. 
              Découvrez tous les outils dont vous avez besoin en un seul endroit.
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-full shadow-xl"
                onClick={() => navigate('/register')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Rejoindre l'aventure
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 rounded-full"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
              >
                Découvrir les fonctionnalités
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Indicateur de scroll */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Section Introduction */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Une solution complète pour votre association
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Fini les outils éparpillés et les informations perdues. EVS CATALA centralise 
              toute la gestion de votre association dans une interface moderne et intuitive.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="h-8 w-8" />, title: "Simple & Intuitif", desc: "Interface moderne pensée pour tous les niveaux" },
              { icon: <Shield className="h-8 w-8" />, title: "Sécurisé", desc: "Vos données protégées et sauvegardées" },
              { icon: <Smartphone className="h-8 w-8" />, title: "Accessible", desc: "Disponible sur tous vos appareils" }
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-blue-600 mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="features" className="bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center py-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Découvrez toutes les fonctionnalités
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque module a été pensé pour répondre aux besoins spécifiques de votre association
            </p>
          </AnimatedSection>

          {/* Agenda */}
          <FeatureSection
            icon={<Calendar className="h-8 w-8" />}
            title="Agenda Collaboratif"
            description="Organisez et partagez tous vos événements associatifs"
            features={[
              "Calendrier interactif avec vues multiples (mois, semaine, jour)",
              "Inscription aux événements en un clic",
              "Notifications automatiques de rappel",
              "Gestion des participants et présences en temps réel"
            ]}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            illustration={<CalendarIllustration />}
          />

          {/* Permanences */}
          <FeatureSection
            icon={<Clock className="h-8 w-8" />}
            title="Gestion des Permanences"
            description="Gérez les créneaux d'ouverture et les présences"
            features={[
              "Planning hebdomadaire des permanences",
              "Inscription rapide aux créneaux disponibles",
              "Suivi des présences et statistiques détaillées",
              "Alertes automatiques pour les créneaux non couverts"
            ]}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            illustration={<PermanencesIllustration />}
            reverse
          />

          {/* Votes */}
          <FeatureSection
            icon={<Vote className="h-8 w-8" />}
            title="Votes & Sondages"
            description="Prenez des décisions collectives en toute transparence"
            features={[
              "Création de votes simples ou à choix multiples",
              "Résultats en temps réel ou différés selon vos besoins",
              "Gestion fine des permissions de vote",
              "Historique complet des décisions prises"
            ]}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            illustration={<VotesIllustration />}
          />

          {/* Projets */}
          <FeatureSection
            icon={<FolderOpen className="h-8 w-8" />}
            title="Gestion de Projets"
            description="Suivez vos projets de A à Z avec votre équipe"
            features={[
              "Fiches projet complètes avec budget et timeline",
              "Attribution des tâches et gestion des deadlines",
              "Gestion des équipes et attribution des rôles",
              "Documents partagés et communication intégrée"
            ]}
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
            illustration={<ProjectsIllustration />}
            reverse
          />

          {/* Annonces */}
          <FeatureSection
            icon={<Bell className="h-8 w-8" />}
            title="Système d'Annonces"
            description="Communiquez efficacement avec tous les membres"
            features={[
              "Annonces ciblées par rôle ou groupe spécifique",
              "Système de priorité et épinglage des messages importants",
              "Pièces jointes et médias intégrés",
              "Suivi de lecture par utilisateur"
            ]}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
            illustration={<AnnouncesIllustration />}
          />

          {/* Messagerie */}
          <FeatureSection
            icon={<MessageSquare className="h-8 w-8" />}
            title="Messagerie Intégrée"
            description="Échangez en privé ou en groupe avec les membres"
            features={[
              "Conversations privées et de groupe",
              "Partage de fichiers intégré et sécurisé",
              "Notifications en temps réel",
              "Historique complet des conversations"
            ]}
            gradient="bg-gradient-to-br from-teal-500 to-green-600"
            illustration={<MessagesIllustration />}
            reverse
          />

          {/* Trombinoscope */}
          <FeatureSection
            icon={<Users className="h-8 w-8" />}
            title="Trombinoscope"
            description="Découvrez et contactez tous les membres"
            features={[
              "Annuaire complet des membres de l'association",
              "Filtrage avancé par rôle et commission",
              "Profils détaillés avec photos et informations",
              "Export des données pour les administrateurs"
            ]}
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
            illustration={<TrombinoscopeIllustration />}
          />
        </div>
      </section>

      {/* Section CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Fond animé */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <span className="text-6xl">🚀</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Prêt à transformer votre association ?
            </h2>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Rejoignez dès maintenant EVS CATALA et découvrez une nouvelle façon 
              de gérer et faire vivre votre association.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-12 py-6 rounded-full shadow-2xl"
                onClick={() => navigate('/register')}
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Créer mon compte gratuitement
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </motion.div>
            
            <p className="text-sm mt-6 opacity-75">
              ✨ Inscription gratuite • 🔒 Données sécurisées • 💝 Support inclus
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default PresentationPage; 