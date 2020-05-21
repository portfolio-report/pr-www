module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'DELETE FROM securities WHERE staged = 1'
    )
    await queryInterface.sequelize.query('PRAGMA foreign_keys=OFF')
    await queryInterface.sequelize.query('BEGIN DEFERRED TRANSACTION')
    try {
      await queryInterface.createTable('securities_new', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        name: {
          type: Sequelize.STRING,
        },
        isin: {
          type: Sequelize.STRING(12),
        },
        wkn: {
          type: Sequelize.STRING(6),
        },
        symbolXfra: {
          type: Sequelize.STRING(10),
        },
        symbolXnas: {
          type: Sequelize.STRING(10),
        },
        symbolXnys: {
          type: Sequelize.STRING(10),
        },
        securityType: {
          type: Sequelize.ENUM('share', 'fund', 'bond', 'index'),
        },
      })

      await queryInterface.sequelize.query(
        'INSERT INTO securities_new SELECT id, uuid, name, isin, wkn, symbolXfra, symbolXnas, symbolXnys, securityType FROM securities'
      )

      await queryInterface.dropTable('securities')
      await queryInterface.renameTable('securities_new', 'securities')

      for (const indexOptions of [
        { fields: ['uuid'], unique: true },
        { fields: ['name'] },
        { fields: ['isin'] },
        { fields: ['wkn'] },
        { fields: ['symbolXfra'] },
        { fields: ['symbolXnas'] },
        { fields: ['symbolXnys'] },
        { fields: ['securityType'] },
      ]) {
        await queryInterface.addIndex('securities', {
          ...indexOptions,
        })
      }

      await queryInterface.sequelize.query('COMMIT')
    } catch (err) {
      await queryInterface.sequelize.query('ROLLBACK')
      throw err
    } finally {
      await queryInterface.sequelize.query('PRAGMA foreign_keys=ON')
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('PRAGMA foreign_keys=OFF')
    await queryInterface.sequelize.query('BEGIN DEFERRED TRANSACTION')
    try {
      await queryInterface.sequelize.query('PRAGMA foreign_keys=OFF')
      await queryInterface.createTable('securities_new', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        name: {
          type: Sequelize.STRING,
        },
        isin: {
          type: Sequelize.STRING(12),
        },
        wkn: {
          type: Sequelize.STRING(6),
        },
        symbolXfra: {
          type: Sequelize.STRING(10),
        },
        symbolXnas: {
          type: Sequelize.STRING(10),
        },
        symbolXnys: {
          type: Sequelize.STRING(10),
        },
        securityType: {
          type: Sequelize.ENUM('share', 'fund', 'bond', 'index'),
        },
        staged: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      })

      await queryInterface.sequelize.query(
        'INSERT INTO securities_new SELECT id, uuid, name, isin, wkn, symbolXfra, symbolXnas, symbolXnys, securityType, 0 as staged FROM securities'
      )

      await queryInterface.dropTable('securities')
      await queryInterface.renameTable('securities_new', 'securities')

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
          ...indexOptions,
        })
      }

      await queryInterface.sequelize.query('COMMIT')
    } catch (err) {
      await queryInterface.sequelize.query('ROLLBACK')
      throw err
    } finally {
      await queryInterface.sequelize.query('PRAGMA foreign_keys=ON')
    }
  },
}
