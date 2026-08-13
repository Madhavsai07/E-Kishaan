import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n';

export default function LanguageToggle({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: LanguageCode) => {
    i18n.changeLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger
        aria-label={t('common.language')}
        className={size === 'sm' ? 'w-[110px] h-9 text-sm' : 'w-[130px] h-11 text-base'}
      >
        <Languages className="w-4 h-4 shrink-0 opacity-70" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
