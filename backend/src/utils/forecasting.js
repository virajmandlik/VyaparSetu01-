// Simple forecasting utility without external dependencies
const Sale = require('../models/Sale');
const Product = require('../models/Product');

/**
 * Generate sales forecast for a specific seller
 * @param {string} sellerId - The ID of the seller
 * @param {number} days - Number of days to forecast (default: 30)
 * @returns {Promise<Object>} - Forecast data
 */
async function generateSalesForecast(sellerId, days = 30) {
  try {
    // Fetch sales data from MongoDB
    const sales = await Sale.find({ seller: sellerId })
      .populate('product')
      .sort({ date: 1 });

    if (sales.length === 0) {
      return {
        success: false,
        message: 'Not enough sales data for forecasting',
        forecast: []
      };
    }

    // Prepare data for Prophet
    const salesData = sales.map(sale => ({
      ds: new Date(sale.date).toISOString().split('T')[0], // Format: YYYY-MM-DD
      y: sale.quantity
    }));

    // Group sales by date (sum quantities for the same date)
    const groupedSales = {};
    salesData.forEach(sale => {
      if (!groupedSales[sale.ds]) {
        groupedSales[sale.ds] = 0;
      }
      groupedSales[sale.ds] += sale.y;
    });

    // Convert grouped data back to array format
    const timeSeriesData = Object.keys(groupedSales).map(date => ({
      ds: date,
      y: groupedSales[date]
    }));

    // Need at least 2 data points for forecasting
    if (timeSeriesData.length < 2) {
      return {
        success: false,
        message: 'Not enough sales data for forecasting',
        forecast: []
      };
    }

    // Simple forecasting using moving average and trend
    // Calculate average daily sales
    const totalSales = timeSeriesData.reduce((sum, day) => sum + day.y, 0);
    const avgDailySales = totalSales / timeSeriesData.length;

    // Calculate trend (simple linear regression)
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    timeSeriesData.forEach((day, i) => {
      sumX += i;
      sumY += day.y;
      sumXY += i * day.y;
      sumX2 += i * i;
    });

    const n = timeSeriesData.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate future dates for forecasting
    const lastDate = new Date(timeSeriesData[timeSeriesData.length - 1].ds);
    const forecast = [];

    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      const dateStr = futureDate.toISOString().split('T')[0];

      // Predict using trend
      const predictedValue = intercept + slope * (n + i - 1);
      // Add some randomness to make it more realistic
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

      forecast.push({
        ds: dateStr,
        yhat: Math.max(0, predictedValue * randomFactor),
        yhat_lower: Math.max(0, predictedValue * 0.8),
        yhat_upper: predictedValue * 1.2
      });
    }

    // Calculate total forecasted sales
    const totalForecast = forecast.reduce((sum, day) => sum + Math.max(0, Math.round(day.yhat)), 0);

    // Get product categories for more detailed forecasting
    const products = await Product.find({ seller: sellerId });
    const categories = [...new Set(products.map(product => product.category))];

    // Generate category-specific forecasts (simplified approach)
    const categoryForecasts = {};

    for (const category of categories) {
      // Get products in this category
      const categoryProducts = products.filter(product => product.category === category);
      const categoryProductIds = categoryProducts.map(product => product._id.toString());

      // Filter sales for this category
      const categorySales = sales.filter(sale =>
        categoryProductIds.includes(sale.product._id.toString())
      );

      // Calculate percentage of sales for this category
      const categoryPercentage = categorySales.length / sales.length;

      // Apply percentage to total forecast
      categoryForecasts[category] = Math.round(totalForecast * categoryPercentage);
    }

    return {
      success: true,
      forecast: forecast.map(day => ({
        date: day.ds,
        quantity: Math.max(0, Math.round(day.yhat)),
        lower: Math.max(0, Math.round(day.yhat_lower)),
        upper: Math.max(0, Math.round(day.yhat_upper))
      })),
      totalForecast,
      categoryForecasts
    };
  } catch (error) {
    console.error('Forecasting error:', error);
    return {
      success: false,
      message: error.message,
      forecast: []
    };
  }
}

/**
 * Generate revenue forecast based on sales forecast and product prices
 * @param {string} sellerId - The ID of the seller
 * @param {number} days - Number of days to forecast (default: 30)
 * @returns {Promise<Object>} - Revenue forecast data
 */
async function generateRevenueForecast(sellerId, days = 30) {
  try {
    // Get sales forecast
    const salesForecast = await generateSalesForecast(sellerId, days);

    if (!salesForecast.success) {
      return {
        success: false,
        message: salesForecast.message,
        forecast: []
      };
    }

    // Get products and their prices
    const products = await Product.find({ seller: sellerId });

    if (products.length === 0) {
      return {
        success: false,
        message: 'No products found for revenue forecasting',
        forecast: []
      };
    }

    // Calculate average product price
    const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
    const averagePrice = totalPrice / products.length;

    // Calculate revenue forecast
    const revenueForecast = salesForecast.forecast.map(day => ({
      date: day.date,
      revenue: parseFloat((day.quantity * averagePrice).toFixed(2)),
      lower: parseFloat((day.lower * averagePrice).toFixed(2)),
      upper: parseFloat((day.upper * averagePrice).toFixed(2))
    }));

    // Calculate total forecasted revenue
    const totalRevenue = parseFloat(salesForecast.totalForecast * averagePrice);

    // Calculate category-specific revenue forecasts
    const categoryRevenueForecasts = {};

    for (const category in salesForecast.categoryForecasts) {
      // Get average price for this category
      const categoryProducts = products.filter(product => product.category === category);
      const categoryTotalPrice = categoryProducts.reduce((sum, product) => sum + product.price, 0);
      const categoryAveragePrice = categoryTotalPrice / categoryProducts.length;

      // Calculate revenue forecast for this category
      categoryRevenueForecasts[category] = parseFloat(
        (salesForecast.categoryForecasts[category] * categoryAveragePrice).toFixed(2)
      );
    }

    return {
      success: true,
      forecast: revenueForecast,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      categoryRevenueForecasts
    };
  } catch (error) {
    console.error('Revenue forecasting error:', error);
    return {
      success: false,
      message: error.message,
      forecast: []
    };
  }
}

module.exports = {
  generateSalesForecast,
  generateRevenueForecast
};
