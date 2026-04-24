import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async createTeam(userId: number, createTeamDto: any) {
    const prisma = this.prisma as any;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only managers and admins can create teams');
    }

    const team = await prisma.team.create({
      data: {
        name: createTeamDto.name,
        description: createTeamDto.description,
        ownerId: userId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    // Log team creation
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_CREATED',
        description: `Team "${team.name}" created`,
        userId,
        metadata: { teamName: team.name },
      },
    });

    return team;
  }

  async getAllTeams() {
    const prisma = this.prisma as any;

    const teams = await prisma.team.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return teams;
  }

  async getTeamById(teamId: number) {
    const prisma = this.prisma as any;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!team) throw new BadRequestException('Team not found');
    return team;
  }

  async updateTeam(teamId: number, userId: number, updateTeamDto: any) {
    const prisma = this.prisma as any;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (team.ownerId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only team owner or admin can update team');
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: updateTeamDto.name || team.name,
        description: updateTeamDto.description || team.description,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    return updatedTeam;
  }

  async deleteTeam(teamId: number, userId: number) {
    const prisma = this.prisma as any;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (team.ownerId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only team owner or admin can delete team');
    }

    await prisma.team.delete({ where: { id: teamId } });

    // Log team deletion
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_DELETED',
        description: `Team "${team.name}" deleted`,
        userId,
        metadata: { teamName: team.name },
      },
    });

    return { message: 'Team deleted successfully' };
  }

  async addMemberToTeam(teamId: number, userId: number, newMemberId: number) {
    const prisma = this.prisma as any;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (team.ownerId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only team owner or admin can add members');
    }

    // Check if member already exists
    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: newMemberId } },
    });

    if (existing) throw new BadRequestException('User is already a team member');

    const teamMember = await prisma.teamMember.create({
      data: { teamId, userId: newMemberId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Log member addition
    const member = await prisma.user.findUnique({ where: { id: newMemberId } });
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_MEMBER_ADDED',
        description: `${member.name} added to team "${team.name}"`,
        userId,
        metadata: { teamId, memberId: newMemberId },
      },
    });

    return teamMember;
  }

  async removeMemberFromTeam(teamId: number, userId: number, memberId: number) {
    const prisma = this.prisma as any;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (team.ownerId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only team owner or admin can remove members');
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: memberId } },
    });

    // Log member removal
    const member = await prisma.user.findUnique({ where: { id: memberId } });
    await prisma.activityLog.create({
      data: {
        action: 'TEAM_MEMBER_REMOVED',
        description: `${member.name} removed from team "${team.name}"`,
        userId,
        metadata: { teamId, memberId },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async getTeamsByOwner(userId: number) {
    const prisma = this.prisma as any;

    const teams = await prisma.team.findMany({
      where: { ownerId: userId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { select: { id: true } },
      },
    });

    return teams;
  }
}
