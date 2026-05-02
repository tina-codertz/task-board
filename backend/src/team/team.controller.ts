import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamService } from './team.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';


@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtAuthGuard)
  @Get('owner/my-teams')
  async getMyTeams(@Request() req: any) {
    return await this.teamService.getMyTeams(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTeam(@Request() req: any, @Body() createTeamDto: any) {
    return await this.teamService.createTeam(req.user.userId, createTeamDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTeams() {
    return { teams: await this.teamService.getAllTeams() };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTeamById(@Param('id') id: string) {
    return await this.teamService.getTeamById(parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateTeam(@Param('id') id: string, @Request() req: any, @Body() updateTeamDto: any) {
    return await this.teamService.updateTeam(parseInt(id), req.user.userId, updateTeamDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTeam(@Param('id') id: string, @Request() req: any) {
    return await this.teamService.deleteTeam(parseInt(id), req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:memberId')
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req: any) {
    return await this.teamService.removeMemberFromTeam(parseInt(id), req.user.userId, parseInt(memberId));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  async addMember(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return await this.teamService.addMemberToTeam(parseInt(id), req.user.userId, body.memberId);
  }


}
