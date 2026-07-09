import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

/**
 * Guards machine-to-machine ingestion routes with a shared secret sent in the
 * `x-api-key` header. Applied at the controller level (see IngestController);
 * those routes are also marked @Public() so the global JwtAuthGuard steps aside
 * and this guard becomes the sole gate.
 *
 * Fails closed: if INGEST_API_KEY is unset, every request is rejected.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INGEST_API_KEY;
    if (!expected) {
      throw new UnauthorizedException('Ingestion API key is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers['x-api-key'];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || !this.safeEqual(provided, expected)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }

  /** Constant-time comparison to avoid leaking the key via timing. */
  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
