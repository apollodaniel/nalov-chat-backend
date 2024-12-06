import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from 'typeorm';

export class InitialMigration1733520547566 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'users',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
					},
					{
						name: 'username',
						type: 'varchar',
						isUnique: true,
					},
					{
						name: 'name',
						type: 'varchar',
					},
					{
						name: 'password',
						type: 'varchar',
					},
					{
						name: 'profilePicture',
						type: 'varchar',
						default: "'default/profile-pictures/default.png'",
					},
				],
			}),
		);

		// Create Messages Table
		await queryRunner.createTable(
			new Table({
				name: 'messages',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
						default: 'uuid_generate_v4()',
					},
					{
						name: 'content',
						type: 'text',
					},
					{
						name: 'creationDate',
						type: 'bigint',
					},
					{
						name: 'lastModifiedDate',
						type: 'bigint',
					},
					{
						name: 'senderId',
						type: 'uuid',
					},
					{
						name: 'receiverId',
						type: 'uuid',
					},
					{
						name: 'seenDate',
						type: 'bigint',
						isNullable: true,
					},
				],
			}),
		);

		// Add foreign keys for messages
		await queryRunner.createForeignKey(
			'messages',
			new TableForeignKey({
				columnNames: ['senderId'],
				referencedColumnNames: ['id'],
				referencedTableName: 'users',
				onDelete: 'CASCADE',
			}),
		);

		await queryRunner.createForeignKey(
			'messages',
			new TableForeignKey({
				columnNames: ['receiverId'],
				referencedColumnNames: ['id'],
				referencedTableName: 'users',
				onDelete: 'CASCADE',
			}),
		);

		// Create Attachments Table
		await queryRunner.createTable(
			new Table({
				name: 'attachments',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
						default: 'uuid_generate_v4()',
					},
					{
						name: 'messageId',
						type: 'uuid',
					},
					{
						name: 'filename',
						type: 'varchar',
					},
					{
						name: 'mimeType',
						type: 'varchar',
					},
					{
						name: 'path',
						type: 'varchar',
					},
					{
						name: 'previewPath',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'byteLength',
						type: 'bigint',
					},
					{
						name: 'date',
						type: 'bigint',
					},
				],
			}),
		);

		// Add foreign key for attachments
		await queryRunner.createForeignKey(
			'attachments',
			new TableForeignKey({
				columnNames: ['messageId'],
				referencedColumnNames: ['id'],
				referencedTableName: 'messages',
				onDelete: 'CASCADE',
			}),
		);

		// Create Auth Table
		await queryRunner.createTable(
			new Table({
				name: 'auth',
				columns: [
					{
						name: 'token',
						type: 'varchar',
						isPrimary: true,
					},
					{
						name: 'userId',
						type: 'uuid',
					},
				],
			}),
		);

		// Add foreign key for auth
		await queryRunner.createForeignKey(
			'auth',
			new TableForeignKey({
				columnNames: ['userId'],
				referencedColumnNames: ['id'],
				referencedTableName: 'users',
				onDelete: 'CASCADE',
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop tables in reverse order to maintain integrity
		const authTable = await queryRunner.getTable('auth');
		const attachmentsTable = await queryRunner.getTable('attachments');
		const messagesTable = await queryRunner.getTable('messages');
		const usersTable = await queryRunner.getTable('users');

		await queryRunner.dropForeignKey('auth', 'auth_userId_fk');
		await queryRunner.dropForeignKey(
			'attachments',
			'attachments_messageId_fk',
		);
		await queryRunner.dropForeignKey('messages', 'messages_senderId_fk');
		await queryRunner.dropForeignKey('messages', 'messages_receiverId_fk');

		await queryRunner.dropTable('auth');
		await queryRunner.dropTable('attachments');
		await queryRunner.dropTable('messages');
		await queryRunner.dropTable('users');
	}
}
