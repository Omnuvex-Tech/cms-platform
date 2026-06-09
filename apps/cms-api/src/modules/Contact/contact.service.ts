import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { MailService } from '../mail/mail.service';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { CreateContactSocialLinkDto } from './dto/create-contact-social-link.dto';
import { UpdateContactSocialLinkDto } from './dto/update-contact-social-link.dto';
import { CreateContactOptionDto } from './dto/create-contact-option.dto';
import { UpdateContactOptionDto } from './dto/update-contact-option.dto';
import { ReorderContactLinksDto } from './dto/reorder-contact-links.dto';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly repo: ContactRepository,
    private readonly mailService: MailService,
  ) { }

  async getOrCreate() {
    const existing = await this.repo.findFirst();
    if (existing) return existing;
    return this.repo.create();
  }

  async getContact() {
    const settings = await this.repo.findFirst();
    if (!settings) return this.repo.create();
    return settings;
  }

  async updateSettings(dto: UpdateContactSettingsDto) {
    const existing = await this.repo.findFirst();
    if (!existing) {
      const created = await this.repo.create();
      return this.repo.updateSettings(created.id, dto);
    }
    return this.repo.updateSettings(existing.id, dto);
  }


  async createSocialLink(dto: CreateContactSocialLinkDto) {
    const contact = await this.getOrCreate();
    return this.repo.createSocialLink(contact.id, dto);
  }

  async updateSocialLink(id: number, dto: UpdateContactSocialLinkDto) {
    const link = await this.repo.findSocialLinkById(id);
    if (!link) throw new NotFoundException(`ContactSocialLink #${id} tapılmadı`);
    return this.repo.updateSocialLink(id, dto);
  }

  async deleteSocialLink(id: number) {
    const link = await this.repo.findSocialLinkById(id);
    if (!link) throw new NotFoundException(`ContactSocialLink #${id} tapılmadı`);
    return this.repo.deleteSocialLink(id);
  }

  async reorderSocialLinks(dto: ReorderContactLinksDto) {
    return this.repo.reorderSocialLinks(dto.links);
  }

  async createBudgetOption(dto: CreateContactOptionDto) {
    const contact = await this.getOrCreate();
    return this.repo.createBudgetOption(contact.id, dto);
  }

  async updateBudgetOption(id: number, dto: UpdateContactOptionDto) {
    const option = await this.repo.findBudgetOptionById(id);
    if (!option) throw new NotFoundException(`BudgetOption #${id} tapılmadı`);
    return this.repo.updateBudgetOption(id, dto);
  }

  async deleteBudgetOption(id: number) {
    const option = await this.repo.findBudgetOptionById(id);
    if (!option) throw new NotFoundException(`BudgetOption #${id} tapılmadı`);
    return this.repo.deleteBudgetOption(id);
  }

  // ─── Timeline Options ───────────────────────────────────────────────────────

  async createTimelineOption(dto: CreateContactOptionDto) {
    const contact = await this.getOrCreate();
    return this.repo.createTimelineOption(contact.id, dto);
  }

  async updateTimelineOption(id: number, dto: UpdateContactOptionDto) {
    const option = await this.repo.findTimelineOptionById(id);
    if (!option) throw new NotFoundException(`TimelineOption #${id} tapılmadı`);
    return this.repo.updateTimelineOption(id, dto);
  }

  async deleteTimelineOption(id: number) {
    const option = await this.repo.findTimelineOptionById(id);
    if (!option) throw new NotFoundException(`TimelineOption #${id} tapılmadı`);
    return this.repo.deleteTimelineOption(id);
  }


  // async createSubmission(dto: CreateContactSubmissionDto) {
  //   const submission = await this.repo.createSubmission(dto);

  //   try {
  //     await this.mailService.sendContactSubmission({
  //       ...dto,
  //       submittedAt: submission.createdAt,
  //     });
  //   } catch (err) {
  //     console.log('MAIL ERROR:', err);
  //   }

  //   return submission;
  // }

  async createSubmission(dto: CreateContactSubmissionDto) {
  const submission = await this.repo.createSubmission(dto);

  try {
    await this.mailService.sendContactSubmission({
      ...dto,
      submittedAt: submission.createdAt,
    });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    // müvəqqəti olaraq xətanı response-a əlavə et
    return { ...submission, mailError: (err as any).message };
  }

  return submission;
}


  async findAllSubmissions() {
    return this.repo.findAllSubmissions();
  }
}