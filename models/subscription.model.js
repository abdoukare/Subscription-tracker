/*
import mongoose from "mongoose";
console.log('loaded subscription.model.js');
const subscriptionSchema = new mongoose.Schema({
	name: {type: String, required: [true, 'subscription name is required']},
	price: {type: Number, required: [true, 'price is required']},
	frequency:{type: String, enum:['daily', 'weekly', 'monthly', 'yearly']},
	category: {type: String, required: [true, 'category is required']},
	paymentMethod: {type: String, required: [true, 'payment method is required']},
	status: {type: String, enum:['active', 'cancelled', 'expired'], default: 'active'},
	startDate: {type: Date, 
		required:true, 
		validate:(value) => value <= new Date(),
	message: 'start date cannot be in the future'},
	renewalDate: {type: Date, 
		//required:true,
		function(value){
			return value > this.startDate;
		},
	message: 'renewal date cannot be before start date'},
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true}
}, {timestamps: true});
// auto-calculate renwal date if missing 
subscriptionSchema.pre('save', function(next) {
	if(!this.renewalDate){
		const renewalPeriods = {
			daily: 1,
			weekly: 7,
			monthly: 30,
			yearly: 365
		};
		this.renewalDate = new Date(this.startDate);
		this.renewalDate = this.startDate.setDate(this.startDate.getDate() + renewalPeriods[this.frequency]);
	}
	// auto-update renewal date if frequency changes
	if(this.renewalDate < new Date()){
		this.status = 'expired';
	}
	next();
});

const subscription = mongoose.model('Subscription', subscriptionSchema);
export default subscription;
*/

import pool from '../database/db.js';

console.log('loaded subscription.model.js');

class Subscription {
  // Create a new subscription
  static async create(subscriptionData) {
    const {
      name,
      price,
      frequency,
      category,
      paymentMethod,
      status = 'active',
      startDate,
      renewalDate,
      user
    } = subscriptionData;

    const query = `
      INSERT INTO subscriptions (
        name, price, frequency, category, payment_method, 
        status, start_date, renewal_date, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id, name, price, frequency, category, payment_method,
        status, start_date, renewal_date, user_id,
        created_at, updated_at
    `;

    const values = [
      name,
      price,
      frequency,
      category,
      paymentMethod,
      status,
      startDate,
      renewalDate || null,
      user
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      // Handle constraint violations
      if (error.code === '23502') { // NOT NULL violation
        const err = new Error(`Required field missing: ${error.column}`);
        err.statusCode = 400;
        throw err;
      }
      if (error.code === '23514') { // CHECK constraint violation
        const err = new Error('Invalid value for frequency or status');
        err.statusCode = 400;
        throw err;
      }
      throw error;
    }
  }

  // Find subscriptions by user ID
  static async find(filter = {}) {
    let query = `
      SELECT 
        id, name, price, frequency, category, payment_method,
        status, start_date, renewal_date, user_id,
        created_at, updated_at
      FROM subscriptions
    `;
    const values = [];
    const conditions = [];

    if (filter.user) {
      conditions.push(`user_id = $${conditions.length + 1}`);
      values.push(filter.user);
    }

    if (filter.status) {
      conditions.push(`status = $${conditions.length + 1}`);
      values.push(filter.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Find subscription by ID
  static async findById(id) {
    const query = `
      SELECT 
        id, name, price, frequency, category, payment_method,
        status, start_date, renewal_date, user_id,
        created_at, updated_at
      FROM subscriptions
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update subscription
  static async findByIdAndUpdate(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Convert camelCase to snake_case for database columns
    const fieldMap = {
      paymentMethod: 'payment_method',
      startDate: 'start_date',
      renewalDate: 'renewal_date',
      userId: 'user_id'
    };

    Object.entries(updates).forEach(([key, value]) => {
      const dbField = fieldMap[key] || key;
      fields.push(`${dbField} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);

    const query = `
      UPDATE subscriptions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, name, price, frequency, category, payment_method,
        status, start_date, renewal_date, user_id,
        created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete subscription
  static async findByIdAndDelete(id) {
    const query = `
      DELETE FROM subscriptions 
      WHERE id = $1 
      RETURNING id, name, user_id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find subscriptions with user data (JOIN)
  static async findWithUser(filter = {}) {
    let query = `
      SELECT 
        s.id, s.name, s.price, s.frequency, s.category, s.payment_method,
        s.status, s.start_date, s.renewal_date, s.user_id,
        s.created_at, s.updated_at,
        u.name as user_name, u.email as user_email
      FROM subscriptions s
      INNER JOIN users u ON s.user_id = u.id
    `;
    
    const values = [];
    const conditions = [];

    if (filter.user) {
      conditions.push(`s.user_id = $${conditions.length + 1}`);
      values.push(filter.user);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get subscriptions expiring soon
  static async findExpiringSoon(userId, daysAhead = 7) {
    const query = `
      SELECT 
        id, name, price, frequency, category, payment_method,
        status, start_date, renewal_date, user_id,
        created_at, updated_at
      FROM subscriptions
      WHERE user_id = $1 
        AND status = 'active'
        AND renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${daysAhead} days'
      ORDER BY renewal_date ASC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

export default Subscription;