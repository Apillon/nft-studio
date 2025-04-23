import { SqlModelStatus } from '../config/values';

export async function upgrade(
  queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
) {
  await queryFn(`
        CREATE TABLE IF NOT EXISTS \`job\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`status\` INT NOT NULL DEFAULT ${SqlModelStatus.DRAFT},
          \`name\` VARCHAR(45) NULL,
          \`parameters\` JSON NOT NULL,
          \`finishedTime\` DATETIME NULL,
          \`lastError\` TEXT NULL,
          \`createTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
          \`updateTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`));
      `);
}
export async function downgrade(
  queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
) {
  await queryFn(`
        DROP TABLE IF EXISTS \`job\` ;
      `);
}
