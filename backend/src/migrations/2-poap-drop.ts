export async function upgrade(
    queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
  ) {
    await queryFn(`
      CREATE TABLE IF NOT EXISTS \`poap_drop\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` VARCHAR(1000) NULL,
        \`startTime\` DATETIME NOT NULL,
        \`endTime\` DATETIME NOT NULL,
        \`website\` VARCHAR(1000) NULL,
        \`collectionUuid\` VARCHAR(36) NOT NULL,
        \`status\` INT NULL,
        \`createTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        \`updateTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`));
    `);
  }
  export async function downgrade(
    queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
  ) {
    await queryFn(`
      DROP TABLE IF EXISTS \`poap_drop\` ;
    `);
  }