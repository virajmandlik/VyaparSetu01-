const { generateSalesForecast, generateRevenueForecast } = require('../utils/forecasting');

/**
 * Get sales forecast for the authenticated seller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSalesForecast = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const days = req.query.days ? parseInt(req.query.days) : 30;
    
    if (isNaN(days) || days <= 0 || days > 365) {
      return res.status(400).json({ 
        error: 'Invalid days parameter. Must be a number between 1 and 365.' 
      });
    }

    const forecast = await generateSalesForecast(sellerId, days);
    
    if (!forecast.success) {
      return res.status(400).json({ error: forecast.message });
    }

    res.status(200).json(forecast);
  } catch (error) {
    console.error('Error getting sales forecast:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get revenue forecast for the authenticated seller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRevenueForecast = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const days = req.query.days ? parseInt(req.query.days) : 30;
    
    if (isNaN(days) || days <= 0 || days > 365) {
      return res.status(400).json({ 
        error: 'Invalid days parameter. Must be a number between 1 and 365.' 
      });
    }

    const forecast = await generateRevenueForecast(sellerId, days);
    
    if (!forecast.success) {
      return res.status(400).json({ error: forecast.message });
    }

    res.status(200).json(forecast);
  } catch (error) {
    console.error('Error getting revenue forecast:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get combined forecast data for the dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboardForecast = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const days = 30; // Fixed 30 days for dashboard
    
    // Get both sales and revenue forecasts
    const [salesForecast, revenueForecast] = await Promise.all([
      generateSalesForecast(sellerId, days),
      generateRevenueForecast(sellerId, days)
    ]);
    
    // Check if either forecast failed
    if (!salesForecast.success || !revenueForecast.success) {
      return res.status(400).json({ 
        error: salesForecast.message || revenueForecast.message 
      });
    }

    // Combine the forecasts for the dashboard
    const dashboardForecast = {
      success: true,
      salesForecast: {
        total: salesForecast.totalForecast,
        byCategory: salesForecast.categoryForecasts,
        daily: salesForecast.forecast.map(day => ({
          date: day.date,
          quantity: day.quantity
        }))
      },
      revenueForecast: {
        total: revenueForecast.totalRevenue,
        byCategory: revenueForecast.categoryRevenueForecasts,
        daily: revenueForecast.forecast.map(day => ({
          date: day.date,
          revenue: day.revenue
        }))
      }
    };

    res.status(200).json(dashboardForecast);
  } catch (error) {
    console.error('Error getting dashboard forecast:', error);
    res.status(500).json({ error: error.message });
  }
};
