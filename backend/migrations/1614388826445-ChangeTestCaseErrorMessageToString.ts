import {MigrationInterface, QueryRunner} from 'typeorm';

export class ChangeTestCaseErrorMessageToString1614388826445
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE TestCase MODIFY COLUMN errorMessage VARCHAR(255) DEFAULT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE TestCase MODIFY COLUMN errorMessage TINYINT(1) DEFAULT 0'
    );
  }
}
