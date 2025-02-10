import { compareSync, genSalt, hashSync } from 'bcryptjs';

class Encrypter {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);
    return hashSync(password, salt);
  }

  async compare(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return compareSync(rawPassword, hashedPassword);
  }
}

export default new Encrypter();
