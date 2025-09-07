import { pool } from '../config/database';
import { getKey } from '../config/redis';
import { logger } from '../utils/logger';
import { User, UserRole } from '../../../shared/types';

export interface CreateUserData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
  password?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  updatedAt?: Date;
}

export class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO users (
          id, email, password, first_name, last_name, phone, role, 
          is_verified, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        userData.id,
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.phone,
        userData.role,
        userData.isVerified,
        userData.isActive,
        userData.createdAt,
        userData.updatedAt,
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE reset_password_token = $1';
      const result = await pool.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const fields = Object.keys(updateData).map((key, index) => {
        const dbKey = this.camelToSnakeCase(key);
        return `${dbKey} = $${index + 2}`;
      });

      const query = `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...Object.values(updateData)];
      const result = await client.query(query, values);
      
      await client.query('COMMIT');

      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      await pool.query(query, [id]);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUsers(page: number = 1, limit: number = 10, role?: UserRole): Promise<{ users: User[]; total: number }> {
    try {
      let whereClause = '';
      let values: any[] = [];
      let valueIndex = 1;

      if (role) {
        whereClause = 'WHERE role = $1';
        values.push(role);
        valueIndex = 2;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const offset = (page - 1) * limit;
      const query = `
        SELECT * FROM users 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;
      
      values.push(limit, offset);
      const result = await pool.query(query, values);

      const users = result.rows.map(row => this.mapDbUserToUser(row));

      return { users, total };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    try {
      return await getKey(`refresh:${userId}`);
    } catch (error) {
      logger.error('Error getting refresh token:', error);
      throw error;
    }
  }

  async getVerificationToken(token: string): Promise<string | null> {
    try {
      return await getKey(`verification:${token}`);
    } catch (error) {
      logger.error('Error getting verification token:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string, page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    try {
      const searchPattern = `%${searchTerm}%`;
      const offset = (page - 1) * limit;

      // Get total count
      const countQuery = `
        SELECT COUNT(*) FROM users 
        WHERE first_name ILIKE $1 
        OR last_name ILIKE $1 
        OR email ILIKE $1
      `;
      const countResult = await pool.query(countQuery, [searchPattern]);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const query = `
        SELECT * FROM users 
        WHERE first_name ILIKE $1 
        OR last_name ILIKE $1 
        OR email ILIKE $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [searchPattern, limit, offset]);
      const users = result.rows.map(row => this.mapDbUserToUser(row));

      return { users, total };
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      phone: dbUser.phone,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role as UserRole,
      profileImage: dbUser.profile_image,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
      isVerified: dbUser.is_verified,
      isActive: dbUser.is_active,
    };
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

