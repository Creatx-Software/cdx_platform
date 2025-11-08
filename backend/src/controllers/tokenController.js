const { Token } = require('../models');
const logger = require('../utils/logger');

// Get all active tokens (Public - no auth required)
exports.getAllTokens = async (req, res, next) => {
  try {
    const tokens = await Token.getAllActiveTokens();

    res.json({
      success: true,
      count: tokens.length,
      tokens
    });
  } catch (error) {
    logger.error('Error in getAllTokens:', error);
    next(error);
  }
};

// Get all tokens including inactive (Admin only)
exports.getAllTokensAdmin = async (req, res, next) => {
  try {
    const tokens = await Token.getAllTokens();

    res.json({
      success: true,
      count: tokens.length,
      tokens
    });
  } catch (error) {
    logger.error('Error in getAllTokensAdmin:', error);
    next(error);
  }
};

// Get single token details (Public)
exports.getTokenDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const token = await Token.getTokenById(id);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    // Get sales statistics
    const stats = await Token.getTokenSalesStats(id);

    res.json({
      success: true,
      token: {
        ...token,
        stats
      }
    });
  } catch (error) {
    logger.error('Error in getTokenDetails:', error);
    next(error);
  }
};

// Create new token (Admin only)
exports.createToken = async (req, res, next) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      tokenAddress,
      blockchain,
      pricePerToken,
      currency,
      minPurchaseAmount,
      maxPurchaseAmount,
      minTokenAmount,
      maxTokenAmount,
      dailyPurchaseLimit,
      isActive,
      displayOrder,
      description,
      logoUrl
    } = req.body;

    // Validation
    if (!tokenName || !tokenSymbol || !blockchain || !pricePerToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenName, tokenSymbol, blockchain, pricePerToken'
      });
    }

    // Check if symbol already exists
    const symbolExists = await Token.tokenSymbolExists(tokenSymbol);
    if (symbolExists) {
      return res.status(409).json({
        success: false,
        message: `Token symbol '${tokenSymbol}' already exists`
      });
    }

    // Validate price
    if (pricePerToken <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per token must be greater than 0'
      });
    }

    // Create token
    const tokenData = {
      tokenName,
      tokenSymbol: tokenSymbol.toUpperCase(),
      tokenAddress,
      blockchain,
      pricePerToken: parseFloat(pricePerToken),
      currency: currency || 'USD',
      minPurchaseAmount: minPurchaseAmount || 10.00,
      maxPurchaseAmount: maxPurchaseAmount || 10000.00,
      minTokenAmount: minTokenAmount || 100,
      maxTokenAmount: maxTokenAmount || 100000,
      dailyPurchaseLimit: dailyPurchaseLimit || 5000.00,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      description,
      logoUrl,
      createdBy: req.userId
    };

    const tokenId = await Token.createToken(tokenData);

    // Log admin action
    // TODO: Add admin action logging

    logger.info(`Token created: ${tokenSymbol} by admin ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Token created successfully',
      tokenId
    });
  } catch (error) {
    logger.error('Error in createToken:', error);
    next(error);
  }
};

// Update token (Admin only)
exports.updateToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if token exists
    const token = await Token.getTokenById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    // If updating symbol, check if new symbol exists
    if (updates.tokenSymbol && updates.tokenSymbol !== token.token_symbol) {
      const symbolExists = await Token.tokenSymbolExists(updates.tokenSymbol, id);
      if (symbolExists) {
        return res.status(409).json({
          success: false,
          message: `Token symbol '${updates.tokenSymbol}' already exists`
        });
      }
    }

    // Validate price if being updated
    if (updates.pricePerToken && updates.pricePerToken <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per token must be greater than 0'
      });
    }

    // Update token
    const updated = await Token.updateToken(id, updates);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update token'
      });
    }

    // Log admin action
    // TODO: Add admin action logging

    logger.info(`Token updated: ID ${id} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Token updated successfully'
    });
  } catch (error) {
    logger.error('Error in updateToken:', error);
    next(error);
  }
};

// Deactivate token (Admin only)
exports.deactivateToken = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if token exists
    const token = await Token.getTokenById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    if (!token.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Token is already inactive'
      });
    }

    // Deactivate token
    const deactivated = await Token.deactivateToken(id);

    if (!deactivated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate token'
      });
    }

    // Log admin action
    // TODO: Add admin action logging

    logger.info(`Token deactivated: ID ${id} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Token deactivated successfully'
    });
  } catch (error) {
    logger.error('Error in deactivateToken:', error);
    next(error);
  }
};

// Activate token (Admin only)
exports.activateToken = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if token exists
    const token = await Token.getTokenById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    if (token.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Token is already active'
      });
    }

    // Activate token
    const activated = await Token.activateToken(id);

    if (!activated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to activate token'
      });
    }

    // Log admin action
    // TODO: Add admin action logging

    logger.info(`Token activated: ID ${id} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Token activated successfully'
    });
  } catch (error) {
    logger.error('Error in activateToken:', error);
    next(error);
  }
};

// Get token sales statistics (Admin only)
exports.getTokenStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if token exists
    const token = await Token.getTokenById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const stats = await Token.getTokenSalesStats(id);

    res.json({
      success: true,
      token: {
        id: token.id,
        name: token.token_name,
        symbol: token.token_symbol
      },
      stats
    });
  } catch (error) {
    logger.error('Error in getTokenStats:', error);
    next(error);
  }
};
