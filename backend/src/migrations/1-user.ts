export async function upgrade(
  queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
) {
  await queryFn(`
      CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`email\` VARCHAR(255) NULL,
        \`email_start_send_time\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`email_sent_time\` DATETIME NULL,
        \`wallet\` VARCHAR(80) NULL,
        \`nft_id\` INT NULL,
        \`tx_hash\` VARCHAR(80) NULL DEFAULT NULL,
        \`amount\` INT NOT NULL DEFAULT 1,
        \`signature\` VARCHAR(200) NULL,
        \`airdrop_status\` INT NOT NULL,
        \`status\` INT NULL,
        \`createTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        \`updateTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`));
    `);

  await queryFn(`
      CREATE UNIQUE INDEX \`email_UNIQUE\` ON \`user\` (\`email\` ASC) VISIBLE;
    `);
  await queryFn(`
    CREATE UNIQUE INDEX \`wallet\` ON \`user\` (\`wallet\` ASC) VISIBLE;
    `);
}
export async function downgrade(
  queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
) {
  await queryFn(`
      DROP TABLE IF EXISTS \`user\` ;
    `);
}
