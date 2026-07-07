import { Injectable } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const childrenInclude = {
  bedroomPricing: { orderBy: { sortOrder: 'asc' as const } },
  standardPlans: { orderBy: { sortOrder: 'asc' as const } },
  internationalTiers: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.ProjectWhereInput) {
    return this.prisma.project.findMany({
      where,
      include: {
        _count: { select: { bedroomPricing: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: childrenInclude,
    });
  }

  create(data: Prisma.ProjectCreateInput) {
    return this.prisma.project.create({
      data,
      include: childrenInclude,
    });
  }

  async update(id: number, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.update({
      where: { id },
      data,
      include: childrenInclude,
    });
  }

  setStatus(id: number, status: ProjectStatus) {
    return this.prisma.project.update({
      where: { id },
      data: { status },
      include: childrenInclude,
    });
  }

  delete(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }

  replaceChildren(id: number) {
    return this.prisma.$transaction([
      this.prisma.bedroomPricing.deleteMany({ where: { projectId: id } }),
      this.prisma.standardPaymentPlan.deleteMany({ where: { projectId: id } }),
      this.prisma.internationalPlanTier.deleteMany({ where: { projectId: id } }),
    ]);
  }
}
