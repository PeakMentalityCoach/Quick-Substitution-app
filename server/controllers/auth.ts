import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { generateToken, generateMagicLinkToken, verifyMagicLinkToken } from '../utils/jwt';
import { sendMagicLink } from '../utils/email';

// Request magic link
export const requestMagicLink = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists, create if not
    let user = await prisma.clubUser.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.clubUser.create({
        data: {
          email,
          role: 'coach',
        },
      });
    }

    // Generate magic link token
    const magicToken = generateMagicLinkToken(email);

    // Send email
    await sendMagicLink(email, magicToken);

    res.json({ message: 'Magic link sent to your email' });
  } catch (error) {
    console.error('Error requesting magic link:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
};

// Verify magic link
export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify token and extract email
    const email = verifyMagicLinkToken(token);

    // Get user
    const user = await prisma.clubUser.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clubName: user.clubName,
      },
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(401).json({ error: 'Invalid or expired magic link' });
  }
};

// Login with admin code
export const loginWithAdminCode = async (req: Request, res: Response) => {
  try {
    const { adminCode, email } = req.body;

    if (!adminCode || !email) {
      return res.status(400).json({ error: 'Admin code and email are required' });
    }

    // Verify admin code
    const expectedAdminCode = process.env.ADMIN_CODE || 'coach123';
    if (adminCode !== expectedAdminCode) {
      return res.status(401).json({ error: 'Invalid admin code' });
    }

    // Check if user exists, create if not
    let user = await prisma.clubUser.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.clubUser.create({
        data: {
          email,
          role: 'coach',
          adminCode,
        },
      });
    }

    // Generate JWT
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clubName: user.clubName,
      },
    });
  } catch (error) {
    console.error('Error logging in with admin code:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.clubUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clubName: user.clubName,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const { name, clubName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.clubUser.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        clubName: clubName || undefined,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clubName: user.clubName,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
