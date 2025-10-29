const { query } = require('../config/database');

const TokenConfig = {
  // Get active configuration
  getActiveConfig: async () => {
    const sql = 'SELECT * FROM token_configuration WHERE is_active = TRUE LIMIT 1';
    const results = await query(sql);
    return results[0] || null;
  },

  // Update configuration
  updateConfig: async (adminId, updates) => {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });
    
    fields.push('updated_by = ?');
    values.push(adminId);
    
    const sql = `UPDATE token_configuration SET ${fields.join(', ')} WHERE is_active = TRUE`;
    await query(sql, values);
  }
};

module.exports = TokenConfig;