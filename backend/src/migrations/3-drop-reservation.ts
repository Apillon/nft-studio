export async function upgrade(
    queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
  ) {
    await queryFn(`
      CREATE TABLE IF NOT EXISTS \`drop_reservation\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`poapDrop_id\` INT NOT NULL,
        \`airdropStatus\` INT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`wallet\` VARCHAR(80) NULL,
        \`txHash\` VARCHAR(80) NULL DEFAULT NULL,
        \`status\` INT NULL,
        \`createTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
        \`updateTime\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_poap_reservation\`
          FOREIGN KEY (\`poapDrop_id\`)
          REFERENCES \`poap_drop\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE NO ACTION);
    `);
  
    await queryFn(`
      CREATE UNIQUE INDEX \`email_poap_drop_UNIQUE\` ON \`drop_reservation\` (\`poapDrop_id\`, \`email\` ASC) VISIBLE;
    `);
  }
  export async function downgrade(
    queryFn: (query: string, values?: any[]) => Promise<Array<any>>,
  ) {
    await queryFn(`
      DROP TABLE IF EXISTS \`drop_reservation\` ;
    `);
  }