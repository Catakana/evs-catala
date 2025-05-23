import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, Check, ChevronsUpDown, Clipboard, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/textBank';

/**
 * Composant qui présente un catalogue des composants UI disponibles
 * Ce composant est utilisé pour la documentation du système de design
 */
const UIComponentsShowcase: React.FC = () => {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié dans le presse-papier');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">UI Kit - Composants</h1>
        <p className="text-muted-foreground">
          Catalogue des composants UI réutilisables pour l'application EVS-catala.
          Ces composants sont basés sur la bibliothèque shadcn/ui.
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basiques</TabsTrigger>
          <TabsTrigger value="forms">Formulaires</TabsTrigger>
          <TabsTrigger value="layout">Mise en page</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* COMPOSANTS BASIQUES */}
        <TabsContent value="basic" className="space-y-6">
          {/* BOUTONS */}
          <ComponentSection
            title="Boutons"
            description="Différentes variantes de boutons pour les actions utilisateur."
            code={`<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
          >
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </ComponentSection>

          {/* BADGES */}
          <ComponentSection
            title="Badges"
            description="Badges pour afficher des informations courtes et des statuts."
            code={`<Badge>Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`}
          >
            <div className="flex flex-wrap gap-4">
              <Badge>Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </ComponentSection>

          {/* AVATAR */}
          <ComponentSection 
            title="Avatar" 
            description="Affiche une image de profil avec fallback"
            code={`<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
          >
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </ComponentSection>
        </TabsContent>

        {/* COMPOSANTS DE FORMULAIRE */}
        <TabsContent value="forms" className="space-y-6">
          {/* INPUT */}
          <ComponentSection 
            title="Input" 
            description="Champ de saisie texte standard."
            code={`<Input placeholder="Email" />
<Input type="password" placeholder="Mot de passe" />`}
          >
            <div className="grid gap-4 max-w-sm">
              <Input placeholder="Email" />
              <Input type="password" placeholder="Mot de passe" />
            </div>
          </ComponentSection>

          {/* CHECKBOX */}
          <ComponentSection 
            title="Checkbox" 
            description="Case à cocher pour les sélections binaires."
            code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accepter les conditions</Label>
</div>`}
          >
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accepter les conditions</Label>
            </div>
          </ComponentSection>

          {/* RADIO GROUP */}
          <ComponentSection 
            title="Radio Group" 
            description="Groupe de boutons radio pour une sélection exclusive."
            code={`<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option 2</Label>
  </div>
</RadioGroup>`}
          >
            <RadioGroup defaultValue="option-one" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="r-option-one" />
                <Label htmlFor="r-option-one">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="r-option-two" />
                <Label htmlFor="r-option-two">Option 2</Label>
              </div>
            </RadioGroup>
          </ComponentSection>

          {/* SELECT */}
          <ComponentSection 
            title="Select" 
            description="Liste déroulante pour sélectionner une option."
            code={`<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Sélectionner" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Pomme</SelectItem>
    <SelectItem value="banana">Banane</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>`}
          >
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Pomme</SelectItem>
                <SelectItem value="banana">Banane</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </ComponentSection>

          {/* SWITCH */}
          <ComponentSection 
            title="Switch" 
            description="Interrupteur pour activer/désactiver une option."
            code={`<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Mode avion</Label>
</div>`}
          >
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Mode avion</Label>
            </div>
          </ComponentSection>

          {/* TEXTAREA */}
          <ComponentSection 
            title="Textarea" 
            description="Zone de texte multiligne."
            code={`<Textarea placeholder="Saisissez votre message ici..." />`}
          >
            <Textarea placeholder="Saisissez votre message ici..." className="max-w-sm" />
          </ComponentSection>
        </TabsContent>

        {/* COMPOSANTS DE MISE EN PAGE */}
        <TabsContent value="layout" className="space-y-6">
          {/* CARD */}
          <ComponentSection 
            title="Card" 
            description="Conteneur pour regrouper des informations liées."
            code={`<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description de la carte</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}
          >
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Titre de la carte</CardTitle>
                <CardDescription>Description de la carte</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contenu de la carte</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
          </ComponentSection>

          {/* ACCORDION */}
          <ComponentSection 
            title="Accordion" 
            description="Conteneur expansible pour organiser le contenu."
            code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      Contenu de la section 1
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>
      Contenu de la section 2
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
          >
            <Accordion type="single" collapsible className="max-w-sm">
              <AccordionItem value="item-1">
                <AccordionTrigger>Section 1</AccordionTrigger>
                <AccordionContent>
                  Contenu de la section 1
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Section 2</AccordionTrigger>
                <AccordionContent>
                  Contenu de la section 2
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ComponentSection>

          {/* SEPARATOR */}
          <ComponentSection 
            title="Separator" 
            description="Ligne de séparation visuelle entre les sections."
            code={`<div>
  <h3>Section 1</h3>
  <Separator className="my-4" />
  <h3>Section 2</h3>
</div>`}
          >
            <div className="max-w-sm">
              <h3 className="text-lg font-medium">Section 1</h3>
              <Separator className="my-4" />
              <h3 className="text-lg font-medium">Section 2</h3>
            </div>
          </ComponentSection>

          {/* TABS */}
          <ComponentSection 
            title="Tabs" 
            description="Système d'onglets pour naviguer entre différentes vues."
            code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
    <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Contenu de l'onglet 1</TabsContent>
  <TabsContent value="tab2">Contenu de l'onglet 2</TabsContent>
</Tabs>`}
          >
            <Tabs defaultValue="tab1" className="max-w-sm">
              <TabsList>
                <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
                <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4">Contenu de l'onglet 1</TabsContent>
              <TabsContent value="tab2" className="p-4">Contenu de l'onglet 2</TabsContent>
            </Tabs>
          </ComponentSection>
        </TabsContent>

        {/* COMPOSANTS DE FEEDBACK */}
        <TabsContent value="feedback" className="space-y-6">
          {/* ALERT */}
          <ComponentSection 
            title="Alert" 
            description="Affiche des messages d'information, d'avertissement ou d'erreur."
            code={`<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Ceci est un message d'information.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Erreur</AlertTitle>
  <AlertDescription>
    Une erreur est survenue.
  </AlertDescription>
</Alert>`}
          >
            <div className="space-y-4 max-w-md">
              <Alert>
                <Info className="h-4 w-4 mr-2" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Ceci est un message d'information.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Une erreur est survenue.
                </AlertDescription>
              </Alert>
            </div>
          </ComponentSection>

          {/* FORM VALIDATION */}
          <ComponentSection 
            title="Validation de formulaire" 
            description="Exemple de validation de formulaire avec messages d'erreur."
            code={`<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Nom d'utilisateur</FormLabel>
      <FormControl>
        <Input placeholder="johndoe" {...field} />
      </FormControl>
      <FormDescription>
        Ceci est votre nom d'utilisateur public.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>`}
          >
            <div className="max-w-sm">
              <FormItem>
                <FormLabel>Nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" />
                </FormControl>
                <FormDescription>
                  Ceci est votre nom d'utilisateur public.
                </FormDescription>
                <FormMessage>Le nom d'utilisateur est requis.</FormMessage>
              </FormItem>
            </div>
          </ComponentSection>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Palettes de couleurs</h2>
        <p className="text-muted-foreground">
          Les couleurs principales utilisées dans l'application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <ColorCard name="Primary" colorClass="bg-primary" textClass="text-primary-foreground" />
          <ColorCard name="Secondary" colorClass="bg-secondary" textClass="text-secondary-foreground" />
          <ColorCard name="Accent" colorClass="bg-accent" textClass="text-accent-foreground" />
          <ColorCard name="Muted" colorClass="bg-muted" textClass="text-muted-foreground" />
          <ColorCard name="Card" colorClass="bg-card" textClass="text-card-foreground" />
          <ColorCard name="Destructive" colorClass="bg-destructive" textClass="text-destructive-foreground" />
          <ColorCard name="Background" colorClass="bg-background" textClass="text-foreground border" />
          <ColorCard name="Foreground" colorClass="bg-foreground" textClass="text-background" />
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Typographie</h2>
        <p className="text-muted-foreground">
          Les différentes tailles et styles de texte utilisés dans l'application.
        </p>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">H1 - Titre principal</h1>
            <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">H2 - Titre secondaire</h2>
            <p className="text-sm text-muted-foreground">text-3xl font-semibold</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">H3 - Titre tertiaire</h3>
            <p className="text-sm text-muted-foreground">text-2xl font-semibold</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-medium">H4 - Sous-titre</h4>
            <p className="text-sm text-muted-foreground">text-xl font-medium</p>
          </div>
          <div className="space-y-2">
            <p className="text-base">Texte normal - paragraphe standard pour le contenu principal.</p>
            <p className="text-sm text-muted-foreground">text-base</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">Texte petit - pour les informations secondaires.</p>
            <p className="text-sm text-muted-foreground">text-sm</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs">Texte très petit - pour les mentions légales, crédits, etc.</p>
            <p className="text-sm text-muted-foreground">text-xs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section de composant avec documentation
interface ComponentSectionProps {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}

const ComponentSection: React.FC<ComponentSectionProps> = ({ title, description, code, children }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigator.clipboard.writeText(code)}
            title="Copier le code"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="border-t border-b">
        <div className="p-6 flex items-center justify-center">
          {children}
        </div>
      </CardContent>
      <CardFooter className="overflow-auto max-h-48">
        <pre className="text-xs p-2 bg-slate-50 rounded w-full overflow-auto">
          <code>{code}</code>
        </pre>
      </CardFooter>
    </Card>
  );
};

// Carte de couleur
interface ColorCardProps {
  name: string;
  colorClass: string;
  textClass: string;
}

const ColorCard: React.FC<ColorCardProps> = ({ name, colorClass, textClass }) => {
  return (
    <div className={`rounded-md overflow-hidden`}>
      <div className={`${colorClass} ${textClass} p-6 h-32 flex items-center justify-center`}>
        <span className="font-medium">{name}</span>
      </div>
      <div className="p-2 bg-slate-50 text-xs font-mono">
        {colorClass}
      </div>
    </div>
  );
};

export default UIComponentsShowcase; 