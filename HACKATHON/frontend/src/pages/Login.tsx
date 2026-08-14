import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LanguageToggle from '@/components/LanguageToggle';
import { Leaf, Eye, EyeOff, ArrowRight, Info } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isApiUrlConfigured } from '@/lib/env';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Already signed in? Skip straight to the dashboard.
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isApiUrlConfigured) {
      toast.info('Backend URL is not configured yet. Entering Dashboard in Guest Mode.');
      navigate('/dashboard');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isApiUrlConfigured) {
      toast.info('Backend URL is not configured. Redirecting to Dashboard.');
      navigate('/dashboard');
      return;
    }

    if (!formData.email) {
      toast.error('Enter your email above first, then click "Forgot password?"');
      return;
    }
    try {
      await resetPassword(formData.email);
      toast.success(`Password reset email sent to ${formData.email}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex flex-col">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
            {t('common.appNameShort')}
          </span>
        </Link>
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-gray-900">{t('auth.login.title')}</CardTitle>
            <CardDescription className="text-lg">{t('auth.login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isApiUrlConfigured && (
              <Alert className="border-blue-300 bg-blue-50 text-blue-900">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertTitle className="font-semibold text-blue-950">Backend URL Not Configured</AlertTitle>
                <AlertDescription className="text-sm mt-1 space-y-3">
                  <p className="text-blue-800">
                    <code className="bg-blue-100 px-1 py-0.5 rounded text-xs font-mono text-blue-900">VITE_API_URL</code> is not set in <code className="bg-blue-100 px-1 py-0.5 rounded text-xs font-mono text-blue-900">.env.local</code>. You can access all dashboard modules directly in Guest Mode!
                  </p>
                  <Button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <span>Continue to Dashboard (Guest Mode)</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">{t('auth.login.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required={isApiUrlConfigured}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg">{t('auth.login.passwordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={isApiUrlConfigured}
                    className="text-lg h-12 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" className="w-5 h-5" />
                  <Label htmlFor="remember" className="text-lg font-normal cursor-pointer">Remember me</Label>
                </div>
                <button type="button" onClick={handleForgotPassword} className="text-green-700 hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? t('auth.login.submitting') : isApiUrlConfigured ? t('auth.login.submit') : t('common.openDashboard')}
              </Button>
            </form>

            <p className="mt-6 text-center text-lg text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link to="/signup" className="text-green-700 font-medium hover:underline">
                {t('auth.login.createOne')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
