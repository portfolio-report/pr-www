module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable(
        'securities',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true },
          uuid: Sequelize.UUID,
          name: Sequelize.STRING,
          isin: Sequelize.STRING(12),
          wkn: Sequelize.STRING(6),
          symbolXfra: Sequelize.STRING(10),
          symbolXnas: Sequelize.STRING(10),
          symbolXnys: Sequelize.STRING(10),
          securityType: Sequelize.ENUM('share', 'fund', 'bond', 'index'),
          staged: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
        },
        {
          transaction,
        }
      )

      for (const indexOptions of [
        { fields: ['uuid', 'staged'] },
        { fields: ['name', 'staged'] },
        { fields: ['isin', 'staged'] },
        { fields: ['wkn', 'staged'] },
        { fields: ['symbolXfra', 'staged'] },
        { fields: ['symbolXnas', 'staged'] },
        { fields: ['symbolXnys', 'staged'] },
        { fields: ['securityType', 'staged'] },
      ]) {
        await queryInterface.addIndex('securities', {
          transaction,
          ...indexOptions,
        })
      }

      await queryInterface.createTable(
        'clientUpdates',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true },
          timestamp: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          version: {
            type: Sequelize.STRING(20),
            allowNull: false,
          },
          country: Sequelize.STRING(2),
          useragent: Sequelize.STRING(50),
        },
        { transaction }
      )

      for (const indexOptions of [
        { fields: ['timestamp'] },
        { fields: ['version'] },
        { fields: ['country'] },
      ]) {
        await queryInterface.addIndex('clientUpdates', {
          transaction,
          ...indexOptions,
        })
      }

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('securities')
    await queryInterface.dropTable('clientUpdates')
  },
}
