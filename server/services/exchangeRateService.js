const axios = require('axios');
const logger = require('../utils/logger');
const { SUPPORTED_CURRENCY_CODES, getBaseCurrency } = require('../config/currencies');

/* * 
* Exchange rate API service 
* Uses a free public API (exchangerate-api) requiring NO key instead of Tianxing Data API */
class ExchangeRateApiService {
    constructor(apiKey) {
        // We ignore the passed in apiKey because we migrated to a free provider
        this.apiKey = apiKey || "bypassed";
        // The free endpoint we are using
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.supportedCurrencies = SUPPORTED_CURRENCY_CODES;
    }

    /* * 
* Get a single exchange rate 
* @param {string} fromCurrency - source currency 
* @param {string} toCurrency - target currency 
* @param {number} amount - amount, default is 1 
* @returns {Promise<number>} exchange rate value */
    async getExchangeRate(fromCurrency, toCurrency, amount = 1) {
        if (fromCurrency === toCurrency) {
            return 1.0;
        }

        try {
            const response = await axios.get(`${this.baseUrl}${fromCurrency}`, {
                timeout: 10000 // 10 seconds timeout
            });

            if (response.data && response.data.rates && response.data.rates[toCurrency]) {
                const rate = response.data.rates[toCurrency];
                return rate * amount;
            } else {
                throw new Error(`Currency ${toCurrency} not found in response`);
            }
        } catch (error) {
            throw new Error(`Failed to fetch rate: ${error.message}`);
        }
    }

    /* * 
* Get exchange rates in batches (based on base currency) 
* @returns {Promise<Array>} exchange rate array */
    async getAllExchangeRates() {
        const rates = [];
        const baseCurrency = getBaseCurrency();

        try {
            // Fetch ALL rates in a single request! Much faster and no rate-limits.
            const response = await axios.get(`${this.baseUrl}${baseCurrency}`, {
                timeout: 10000
            });
            
            if (!response.data || !response.data.rates) {
                logger.warn('Invalid response from exchange rate API');
                return rates;
            }

            const apiRates = response.data.rates;

            // Add base currency to own exchange rate
            rates.push({
                from_currency: baseCurrency,
                to_currency: baseCurrency,
                rate: 1.0
            });

            for (const currency of this.supportedCurrencies) {
                if (currency === baseCurrency) continue;

                if (apiRates[currency]) {
                    rates.push({
                        from_currency: baseCurrency,
                        to_currency: currency,
                        rate: apiRates[currency]
                    });
                } else {
                    logger.error(`Currency ${currency} missing from API response`);
                }
            }
        } catch (error) {
            logger.error(`Failed to fetch rates:`, error.message);
        }

        return rates;
    }

    /* * 
* Delay function  - not really needed anymore but kept for compatibility
* @param {number} ms - delay in milliseconds */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /* * 
* Verify that the API key is valid 
* @returns {Promise<boolean>} Is it valid? */
    async validateApiKey() {
        // Since we migrated to a free public API, it's ALWAYS valid automatically!
        return true;
    }
}

module.exports = ExchangeRateApiService;
