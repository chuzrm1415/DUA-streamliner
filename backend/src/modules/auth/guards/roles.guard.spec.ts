import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

function mockContext(role: string, handler = {}, controller = {}): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
  } as any;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext('CUSTOMS_AGENT'))).toBe(true);
  });

  it('allows access when user role matches required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    expect(guard.canActivate(mockContext('MANAGER'))).toBe(true);
  });

  it('denies access when user role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    expect(guard.canActivate(mockContext('CUSTOMS_AGENT'))).toBe(false);
  });

  it('allows CUSTOMS_AGENT when that role is required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['CUSTOMS_AGENT']);
    expect(guard.canActivate(mockContext('CUSTOMS_AGENT'))).toBe(true);
  });
});
