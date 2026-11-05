import { Request, Response } from 'express';
import Member from '../../models/member.model';

// PATCH /api/admin/members/:id/leadership
// body: { leadershipTier: 'Co-Founder' | 'Leader' | 'Member',
//         leadershipTitle?: string, displayOrder?: number }
// Controls where a member appears on the public Members page. Display only:
// never touches User.role or the account itself.
export const updateMemberLeadership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { leadershipTier, leadershipTitle, displayOrder } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      res.status(404).json({
        status: 'fail',
        message: 'Member not found',
      });
      return;
    }

    await member.update({
      leadershipTier,
      // Empty string clears the title; undefined leaves it untouched.
      leadershipTitle:
        leadershipTitle === undefined ? member.leadershipTitle : leadershipTitle || null,
      displayOrder: displayOrder ?? member.displayOrder,
      updatedAt: new Date(),
    });

    res.status(200).json({
      status: 'success',
      message: 'Member leadership updated',
      data: {
        member: {
          id: member.id,
          leadershipTier: member.leadershipTier,
          leadershipTitle: member.leadershipTitle,
          displayOrder: member.displayOrder,
        },
      },
    });
  } catch (error) {
    console.error('Error updating member leadership:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update member leadership',
    });
  }
};
