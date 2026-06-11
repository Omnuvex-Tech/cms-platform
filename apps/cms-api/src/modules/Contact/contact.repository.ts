import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { CreateContactSocialLinkDto } from './dto/create-contact-social-link.dto';
import { UpdateContactSocialLinkDto } from './dto/update-contact-social-link.dto';
import { CreateContactOptionDto } from './dto/create-contact-option.dto';
import { UpdateContactOptionDto } from './dto/update-contact-option.dto';
import { ReorderContactLinkItemDto } from './dto/reorder-contact-links.dto';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst() {
    return this.prisma.contactSettings.findFirst({
      include: {
        socialLinks: { orderBy: { order: 'asc' } },
        budgetOptions: { orderBy: { order: 'asc' } },
        timelineOptions: { orderBy: { order: 'asc' } },
      },
    });
  }

  async create() {
    return this.prisma.contactSettings.create({
      data: {},
      include: {
        socialLinks: { orderBy: { order: 'asc' } },
        budgetOptions: { orderBy: { order: 'asc' } },
        timelineOptions: { orderBy: { order: 'asc' } },
      },
    });
  }

  async updateSettings(id: number, dto: UpdateContactSettingsDto) {
    return this.prisma.contactSettings.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.emailLabel !== undefined && { emailLabel: dto.emailLabel }),
        ...(dto.emailValue !== undefined && { emailValue: dto.emailValue }),
        ...(dto.phoneLabel !== undefined && { phoneLabel: dto.phoneLabel }),
        ...(dto.phoneValue !== undefined && { phoneValue: dto.phoneValue }),
        ...(dto.locationLabel !== undefined && { locationLabel: dto.locationLabel }),
        ...(dto.locationValue !== undefined && { locationValue: dto.locationValue }),
        ...(dto.hoursLabel !== undefined && { hoursLabel: dto.hoursLabel }),
        ...(dto.hoursValue !== undefined && { hoursValue: dto.hoursValue }),
        ...(dto.followUsLabel !== undefined && { followUsLabel: dto.followUsLabel }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.formNameLabel !== undefined && { formNameLabel: dto.formNameLabel }),
        ...(dto.formNamePlaceholder !== undefined && { formNamePlaceholder: dto.formNamePlaceholder }),
        ...(dto.formEmailLabel !== undefined && { formEmailLabel: dto.formEmailLabel }),
        ...(dto.formEmailPlaceholder !== undefined && { formEmailPlaceholder: dto.formEmailPlaceholder }),
        ...(dto.formPhoneLabel !== undefined && { formPhoneLabel: dto.formPhoneLabel }),
        ...(dto.formPhonePlaceholder !== undefined && { formPhonePlaceholder: dto.formPhonePlaceholder }),
        ...(dto.formServiceLabel !== undefined && { formServiceLabel: dto.formServiceLabel }),
        ...(dto.formBudgetLabel !== undefined && { formBudgetLabel: dto.formBudgetLabel }),
        ...(dto.formBudgetPlaceholder !== undefined && { formBudgetPlaceholder: dto.formBudgetPlaceholder }),
        ...(dto.formTimelineLabel !== undefined && { formTimelineLabel: dto.formTimelineLabel }),
        ...(dto.formTimelinePlaceholder !== undefined && { formTimelinePlaceholder: dto.formTimelinePlaceholder }),
        ...(dto.formMessageLabel !== undefined && { formMessageLabel: dto.formMessageLabel }),
        ...(dto.formMessagePlaceholder !== undefined && { formMessagePlaceholder: dto.formMessagePlaceholder }),
        ...(dto.formSubmitLabel !== undefined && { formSubmitLabel: dto.formSubmitLabel }),
      },
      include: {
        socialLinks: { orderBy: { order: 'asc' } },
        budgetOptions: { orderBy: { order: 'asc' } },
        timelineOptions: { orderBy: { order: 'asc' } },
      },
    });
  }

  // ── Social Links ────────────────────────────────────────────────────────────

  async createSocialLink(contactId: number, dto: CreateContactSocialLinkDto) {
    return this.prisma.contactSocialLink.create({
      data: {
        icon: dto.icon,
        href: dto.href,
        order: dto.order ?? 0,
        isVisible: dto.isVisible ?? true,
        contactId,
      },
    });
  }

  async updateSocialLink(id: number, dto: UpdateContactSocialLinkDto) {
    return this.prisma.contactSocialLink.update({
      where: { id },
      data: {
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.href !== undefined && { href: dto.href }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
      },
    });
  }

  async deleteSocialLink(id: number) {
    return this.prisma.contactSocialLink.delete({ where: { id } });
  }

  async findSocialLinkById(id: number) {
    return this.prisma.contactSocialLink.findUnique({ where: { id } });
  }

  async reorderSocialLinks(links: ReorderContactLinkItemDto[]) {
    return this.prisma.$transaction(
      links.map((l) =>
        this.prisma.contactSocialLink.update({
          where: { id: l.id },
          data: { order: l.order },
        }),
      ),
    );
  }

  // ── Budget Options ──────────────────────────────────────────────────────────

  async createBudgetOption(contactId: number, dto: CreateContactOptionDto) {
    return this.prisma.contactBudgetOption.create({
      data: { label: dto.label, order: dto.order ?? 0, contactId },
    });
  }

  async updateBudgetOption(id: number, dto: UpdateContactOptionDto) {
    return this.prisma.contactBudgetOption.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async deleteBudgetOption(id: number) {
    return this.prisma.contactBudgetOption.delete({ where: { id } });
  }

  async findBudgetOptionById(id: number) {
    return this.prisma.contactBudgetOption.findUnique({ where: { id } });
  }

  // ── Timeline Options ────────────────────────────────────────────────────────

  async createTimelineOption(contactId: number, dto: CreateContactOptionDto) {
    return this.prisma.contactTimelineOption.create({
      data: { label: dto.label, order: dto.order ?? 0, contactId },
    });
  }

  async updateTimelineOption(id: number, dto: UpdateContactOptionDto) {
    return this.prisma.contactTimelineOption.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async deleteTimelineOption(id: number) {
    return this.prisma.contactTimelineOption.delete({ where: { id } });
  }

  async findTimelineOptionById(id: number) {
    return this.prisma.contactTimelineOption.findUnique({ where: { id } });
  }

  // ── Submissions ─────────────────────────────────────────────────────────────

  async createSubmission(dto: CreateContactSubmissionDto) {
    return this.prisma.contactSubmission.create({ data: dto });
  }

  async findAllSubmissions() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}