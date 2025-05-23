import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  maxAttachments?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = 'Écrivez votre message...',
  isLoading = false,
  className,
  maxAttachments = 5
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && attachments.length === 0) {
      return;
    }
    
    onSendMessage(trimmedMessage, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Envoyer le message avec Entrée, mais autoriser Shift+Entrée pour un saut de ligne
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    // Limiter le nombre de pièces jointes
    if (attachments.length + newFiles.length > maxAttachments) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxAttachments} pièces jointes.`);
      return;
    }
    
    // Limiter la taille des fichiers (10 Mo)
    const maxFileSize = 10 * 1024 * 1024; // 10 Mo
    const oversizedFiles = newFiles.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      alert(`Certains fichiers dépassent la taille limite de 10 Mo: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setAttachments(prev => [...prev, ...newFiles]);
    
    // Réinitialiser l'input file pour permettre de sélectionner à nouveau le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} Ko`;
    } else {
      return `${Math.round(size / (1024 * 1024) * 10) / 10} Mo`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("p-3", className)}>
      {/* Prévisualisation des pièces jointes */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1 bg-muted rounded p-1.5 text-xs"
            >
              <span className="truncate max-w-[100px]">{file.name}</span>
              <span className="text-muted-foreground">({getFileSize(file.size)})</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full ml-1 hover:bg-muted-foreground/20"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {/* Input pour les pièces jointes (caché) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        />
        
        {/* Bouton pour ouvrir le sélecteur de fichiers */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full h-9 w-9 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || attachments.length >= maxAttachments}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        {/* Textarea pour le message */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] max-h-[200px] resize-none"
          disabled={isLoading}
          rows={1}
        />
        
        {/* Bouton d'envoi */}
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="rounded-full h-9 w-9 flex-shrink-0"
          disabled={isLoading || (message.trim() === '' && attachments.length === 0)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput; 