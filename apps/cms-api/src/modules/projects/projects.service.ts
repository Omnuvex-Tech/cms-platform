import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { BotSyncService } from '../bot-sync/bot-sync.service';
import { ProjectWithChildren } from '../bot-sync/bot-sync.mapper';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly botSync: BotSyncService,
  ) {}

  list(search?: string, status?: ProjectStatus, tag?: string) {
    const where: Prisma.ProjectWhereInput = {};
    if (status) where.status = status;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.projectsRepository.findMany(where);
  }

  async get(id: number) {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto) {
    const { bedroomPricing, standardPlans, internationalTiers, ...rest } = dto;
    return this.projectsRepository.create({
      ...rest,
      bedroomPricing: bedroomPricing?.length
        ? { create: bedroomPricing }
        : undefined,
      standardPlans: standardPlans?.length
        ? { create: standardPlans }
        : undefined,
      internationalTiers: internationalTiers?.length
        ? { create: internationalTiers }
        : undefined,
    });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.get(id);
    const { bedroomPricing, standardPlans, internationalTiers, ...rest } = dto;

    // Children are edited as whole tables: wipe and recreate to keep it simple.
    if (bedroomPricing || standardPlans || internationalTiers) {
      await this.projectsRepository.replaceChildren(id);
    }

    const project = await this.projectsRepository.update(id, {
      ...rest,
      bedroomPricing: bedroomPricing?.length
        ? { create: bedroomPricing }
        : undefined,
      standardPlans: standardPlans?.length
        ? { create: standardPlans }
        : undefined,
      internationalTiers: internationalTiers?.length
        ? { create: internationalTiers }
        : undefined,
    });

    // Propagate edits to the bot only for projects it already knows about
    // (published). Fire-and-forget: a bot outage must not fail the edit.
    if (project.status === ProjectStatus.published) {
      void this.botSync.syncProject(project as ProjectWithChildren, 'upsert');
    }
    return project;
  }

  async archive(id: number) {
    await this.get(id);
    const project = await this.projectsRepository.setStatus(
      id,
      ProjectStatus.archived,
    );
    // Archiving pulls a project out of the customer-facing catalogue -> tell the
    // bot to drop it from its knowledge base.
    void this.botSync.syncProject(project as ProjectWithChildren, 'delete');
    return project;
  }

  async publish(id: number) {
    const { ready, issues, warnings } = await this.validate(id);
    if (!ready) {
      return { published: false, issues, warnings };
    }
    const project = await this.projectsRepository.setStatus(
      id,
      ProjectStatus.published,
    );
    // Primary sync trigger. Awaited (bounded by BOT_SYNC_TIMEOUT_MS, never
    // throws) so the admin sees whether the push landed in the response.
    const botSync = await this.botSync.syncProject(
      project as ProjectWithChildren,
      'upsert',
    );
    return { published: true, issues: [], warnings, project, botSync };
  }

  async remove(id: number) {
    const project = await this.get(id);
    await this.projectsRepository.delete(id);
    // If the bot had this project (it was published), tell it to drop it.
    if (project.status === ProjectStatus.published) {
      void this.botSync.syncProject(project as ProjectWithChildren, 'delete');
    }
    return { deleted: true };
  }

  /** Backfill: re-push every published project to the bot (cutover/recovery). */
  syncAll() {
    return this.botSync.syncAllPublished();
  }

  /**
   * Flags missing/inconsistent sales fields before publishing.
   *
   * `issues` block the publish; `warnings` don't — they're for a project that
   * will work fine but reach fewer customers than the admin probably intends.
   */
  async validate(id: number) {
    const project = await this.get(id);
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!project.name?.trim()) issues.push('Project name is required.');
    if (!project.location?.trim()) issues.push('Location is required.');
    if (!project.aboutProject?.trim())
      issues.push('“About Project” description is empty.');
    if (project.pricePerM2Min == null && project.totalPriceMin == null)
      issues.push('No pricing set (price per m² or total price).');
    if (
      project.pricePerM2Min != null &&
      project.pricePerM2Max != null &&
      project.pricePerM2Min > project.pricePerM2Max
    )
      issues.push('Price per m² min is greater than max.');
    if (project.bedroomPricing.length === 0)
      issues.push('At least one bedroom pricing row is required.');
    if (project.completionYear == null && !project.readyToMoveIn)
      issues.push('Completion year is missing (and not marked ready to move in).');

    // Not an issue: an untagged project is still quoted, searched and matched on
    // budget. It just never claims a category slot when the agent introduces the
    // portfolio, which is easy to do by accident and invisible afterwards.
    if (project.tags.length === 0)
      warnings.push(
        'No tags set — the agent won’t feature this project when it introduces the portfolio.',
      );

    return { ready: issues.length === 0, issues, warnings };
  }
}
