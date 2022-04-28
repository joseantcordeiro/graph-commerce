export class SessionInfoDto {
  constructor(
    public sessionHandle: string,
    public userId: string,
    public accessTokenPayload: any,
  ) {}

  public toJSON(): any {
    return {
      sessionHandle: this.sessionHandle,
      userId: this.userId,
      accessTokenPayload: this.accessTokenPayload,
    };
  }
}
