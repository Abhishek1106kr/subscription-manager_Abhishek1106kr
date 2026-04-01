import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { type CurrencyType, isBaseCurrency } from '@/config/currency';
import { formatCurrencyAmount } from '@/utils/currency';
import { logger } from '@/utils/logger';
import { CURRENCY_NAMES } from '@/config/constants';

export function ExchangeRateManager() {
  const { t } = useTranslation('settings');
  const {
    exchangeRates,
    lastExchangeRateUpdate,
    exchangeRateConfigStatus,
    fetchExchangeRates,
    updateExchangeRatesFromApi,
    currency,
    setCurrency,
    showOriginalCurrency,
    setShowOriginalCurrency
  } = useSettingsStore();
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Update exchange rates manually
  const handleUpdateRates = async () => {
    setIsUpdating(true);
    try {
      await updateExchangeRatesFromApi();
    } catch (error) {
      logger.error('Failed to update exchange rates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatLastUpdate = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return t('justNow');
    }
  };

  // Calculate relative rates based on the selected default currency
  const baseRate = exchangeRates[currency] || 1;
  const displayRates = Object.entries(exchangeRates).reduce((acc, [curr, rate]) => {
    acc[curr] = rate / baseRate;
    return acc;
  }, {} as Record<string, number>);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top row: currency settings and status cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="h-full">
          <Card className="flex flex-col h-full antigravity-card border-none shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1">
            <CardHeader className="border-b border-foreground/5 dark:border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg"><RefreshCw className="h-5 w-5 text-primary" /></div>
                {t('currencySettings')}
              </CardTitle>
              <CardDescription>
                {t('setPreferredCurrency')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
              <div className="space-y-3">
                <Label htmlFor="currency" className="text-sm font-medium text-foreground/80">{t('defaultCurrency')}</Label>
                <Select
                  value={currency}
                  onValueChange={async (value: CurrencyType) => await setCurrency(value)}
                >
                  <SelectTrigger id="currency" className="bg-foreground/5 border-none h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder={t('selectCurrency')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-foreground/10 bg-background/95 backdrop-blur-xl">
                    <SelectItem value="CNY">CNY - {t('chineseYuan')}</SelectItem>
                    <SelectItem value="USD">USD - {t('usDollar')}</SelectItem>
                    <SelectItem value="EUR">EUR - {t('euro')}</SelectItem>
                    <SelectItem value="GBP">GBP - {t('britishPound')}</SelectItem>
                    <SelectItem value="CAD">CAD - {t('canadianDollar')}</SelectItem>
                    <SelectItem value="AUD">AUD - {t('australianDollar')}</SelectItem>
                    <SelectItem value="JPY">JPY - {t('japaneseYen')}</SelectItem>
                    <SelectItem value="TRY">TRY - {t('turkishLira')}</SelectItem>
                    <SelectItem value="HKD">HKD - {t('hongKongDollar')}</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('preferredCurrencyDesc')}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/5 border border-foreground/10">
                <div>
                  <Label className="text-base font-medium">{t('showInOriginalCurrency')}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('showOriginalCurrencyDesc')}
                  </p>
                </div>
                <Switch
                  id="show-original"
                  checked={showOriginalCurrency}
                  onCheckedChange={setShowOriginalCurrency}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="h-full">
          <Card className="flex flex-col h-full antigravity-card border-none shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1">
            <CardHeader className="border-b border-foreground/5 dark:border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Clock className="h-5 w-5 text-blue-500" /></div>
                {t('exchangeRateStatus')}
              </CardTitle>
              <CardDescription>
                {t('automaticExchangeRateUpdates')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pt-6">
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-xl bg-foreground/5 border border-foreground/5">
                    <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">{t('apiProvider')}</p>
                    <p className="text-sm font-semibold">exchangerate-api.com</p>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-foreground/5 border border-foreground/5">
                    <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">{t('apiConfiguration')}</p>
                    <div className="flex items-center gap-2">
                      {exchangeRateConfigStatus?.tianApiConfigured ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t('configured')}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-rose-500" />
                          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{t('notConfigured')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-xl bg-foreground/5 border border-foreground/5">
                    <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">{t('updateFrequency')}</p>
                    <p className="text-sm font-semibold text-foreground/90">{t('dailyAutomatic')}</p>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-foreground/5 border border-foreground/5">
                    <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">{t('lastSuccessfulUpdate')}</p>
                    <p className="text-sm font-semibold text-foreground/90">
                      {formatLastUpdate(lastExchangeRateUpdate)}
                    </p>
                  </div>
                </div>

                {!exchangeRateConfigStatus?.tianApiConfigured && (
                  <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      {t('notConfigured')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  onClick={handleUpdateRates}
                  disabled={isUpdating || !exchangeRateConfigStatus?.tianApiConfigured}
                  size="default"
                  className="rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex-1 md:flex-none"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t('updateNow')}
                </Button>

                <Button
                  onClick={fetchExchangeRates}
                  variant="outline"
                  size="default"
                  disabled={isUpdating}
                  className="rounded-full bg-foreground/5 border-foreground/10 hover:bg-foreground/10 transition-all hover:scale-105 active:scale-95 flex-1 md:flex-none"
                >
                  <RefreshCw className="h-4 w-4 mr-2 opacity-70" />
                  {t('refreshRates')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Exchange rate list */}
      <motion.div variants={itemVariants}>
        <Card className="antigravity-card border-none shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
          <CardHeader className="border-b border-foreground/5 dark:border-white/5 bg-foreground/[0.02]">
            <CardTitle>{t('currentExchangeRates')}</CardTitle>
            <CardDescription>
              {t('allRatesRelativeTo', { currency })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-h-[60vh] pr-2 overflow-y-auto custom-scrollbar">
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
              {Object.entries(displayRates).map(([curr, rate]) => (
                <motion.div
                  key={curr}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`group relative flex flex-col justify-center p-4 border rounded-2xl transition-all duration-300 cursor-default overflow-hidden backdrop-blur-md
                    ${currency === curr 
                      ? 'border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary/10 ring-1 ring-primary/30' 
                      : 'border-foreground/10 hover:border-foreground/30 bg-background/50 shadow-sm'
                    }`}
                >
                  {/* Moving Animated Glow Background (Revealed on Hover) */}
                  <div 
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 z-0",
                      currency === curr ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    style={{
                      backgroundImage: "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 50%, rgba(236,72,153,0.2) 100%)",
                      backgroundSize: "400% 400%",
                      animation: "antigravity-mesh 3s ease infinite"
                    }}
                  />

                  {/* 1px Inner Glass Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

                  <div className="relative z-10 flex justify-between items-start mb-2">
                    <p className="font-bold text-lg tracking-tight text-foreground">{curr}</p>
                    {currency === curr && (
                      <CheckCircle className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    )}
                  </div>
                  <p className="relative z-10 text-xs text-muted-foreground font-medium mb-3 opacity-90 h-4">
                    {CURRENCY_NAMES[curr as keyof typeof CURRENCY_NAMES] || curr}
                  </p>
                  <div className="relative z-10 mt-auto px-3 py-1.5 bg-background/60 shadow-sm backdrop-blur-xl rounded-lg w-fit border border-foreground/5 group-hover:border-foreground/20 transition-colors">
                    <p className="text-sm font-semibold tracking-tight text-foreground">
                      {formatCurrencyAmount(rate, curr, false)}
                    </p>
                  </div>
                </motion.div>
              ))}
              </motion.div>
            </div>

            {Object.keys(exchangeRates).length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-foreground/5 rounded-2xl border border-dashed border-foreground/20">
                <AlertCircle className="h-12 w-12 opacity-20 mb-4" />
                <p className="font-medium">{t('noExchangeRatesAvailable')}</p>
                <Button
                  onClick={fetchExchangeRates}
                  className="mt-6 rounded-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('loadRates')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
