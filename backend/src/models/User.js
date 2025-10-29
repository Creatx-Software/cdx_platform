const { query } = require('../config/database');
const { hashPassword } = require('../utils/bcrypt');
const { generateVerificationToken, getExpiryDate } = require('../utils/helpers');

const User = {
  // Create new user
  createUser: async (userData) => {
    const { email, password, firstName, lastName } = userData;
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = getExpiryDate(24); // 24 hours
    
    const sql = `
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        email_verification_token, 
        email_verification_expires
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      email,
      passwordHash,
      firstName,
      lastName,
      verificationToken,
      verificationExpiry
    ]);
    
    return {
      userId: result.insertId,
      verificationToken
    };
  },

  // Find user by email
  findUserByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0] || null;
  },

  // Find user by ID
  findUserById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Update user
  updateUser: async (id, updates) => {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });
    
    values.push(id);
    
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
  },

  // Verify user email
  verifyUserEmail: async (token) => {
    // Find user by token
    const sql = `
      SELECT id FROM users 
      WHERE email_verification_token = ? 
      AND email_verification_expires > NOW()
    `;
    const results = await query(sql, [token]);
    
    if (results.length === 0) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    const userId = results[0].id;
    
    // Update user
    await query(
      `UPDATE users 
       SET email_verified = TRUE, 
           email_verification_token = NULL, 
           email_verification_expires = NULL 
       WHERE id = ?`,
      [userId]
    );
    
    return { success: true, userId };
  },

  // Update password
  updatePassword: async (userId, newPassword) => {
    const passwordHash = await hashPassword(newPassword);
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await query(sql, [passwordHash, userId]);
  },

  // Set password reset token
  setPasswordResetToken: async (email) => {
    const resetToken = generateVerificationToken();
    const resetExpiry = getExpiryDate(1); // 1 hour
    
    const sql = `
      UPDATE users 
      SET password_reset_token = ?, 
          password_reset_expires = ? 
      WHERE email = ?
    `;
    
    const result = await query(sql, [resetToken, resetExpiry, email]);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return resetToken;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    // Find user by token
    const sql = `
      SELECT id FROM users 
      WHERE password_reset_token = ? 
      AND password_reset_expires > NOW()
    `;
    const results = await query(sql, [token]);
    
    if (results.length === 0) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    const userId = results[0].id;
    
    // Update password
    const passwordHash = await hashPassword(newPassword);
    await query(
      `UPDATE users 
       SET password_hash = ?, 
           password_reset_token = NULL, 
           password_reset_expires = NULL 
       WHERE id = ?`,
      [passwordHash, userId]
    );
    
    return { success: true, userId };
  },

  // Update wallet address
  updateWalletAddress: async (userId, walletAddress) => {
    const sql = 'UPDATE users SET solana_wallet_address = ? WHERE id = ?';
    await query(sql, [walletAddress, userId]);
  },

  // Update last login
  updateLastLogin: async (userId, ipAddress) => {
    const sql = `
      UPDATE users 
      SET last_login_at = NOW(), 
          last_login_ip = ? 
      WHERE id = ?
    `;
    await query(sql, [ipAddress, userId]);
  }
};

module.exports = User;