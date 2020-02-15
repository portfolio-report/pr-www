module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('PRAGMA foreign_keys=OFF')
    await queryInterface.sequelize.query('BEGIN DEFERRED TRANSACTION')
    try {
      await queryInterface.createTable('markets_new', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        securityId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'securities',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        marketCode: {
          type: Sequelize.STRING(4),
          allowNull: false,
        },
        currencyCode: {
          type: Sequelize.STRING(3),
          allowNull: true,
        },
        firstPriceDate: Sequelize.DATEONLY,
        lastPriceDate: Sequelize.DATEONLY,
        symbol: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
      })

      await queryInterface.sequelize.query(
        'INSERT INTO markets_new SELECT id, securityId, marketCode, currencyCode, firstPriceDate, lastPriceDate, NULL as symbol FROM markets'
      )

      await queryInterface.dropTable('markets')
      await queryInterface.renameTable('markets_new', 'markets')

      for (const indexOptions of [
        { fields: ['securityId'] },
        { fields: ['securityId', 'marketCode'], unique: true },
      ]) {
        await queryInterface.addIndex('markets', {
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
      await queryInterface.createTable('markets_new', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        securityId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'securities',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        marketCode: {
          type: Sequelize.STRING(4),
          allowNull: false,
        },
        currencyCode: {
          type: Sequelize.STRING(3),
          allowNull: true,
        },
        firstPriceDate: Sequelize.DATEONLY,
        lastPriceDate: Sequelize.DATEONLY,
      })

      await queryInterface.sequelize.query(
        'INSERT INTO markets_new SELECT id, securityId, marketCode, currencyCode, firstPriceDate, lastPriceDate FROM markets'
      )

      await queryInterface.dropTable('markets')
      await queryInterface.renameTable('markets_new', 'markets')

      for (const indexOptions of [
        { fields: ['securityId'] },
        { fields: ['securityId', 'marketCode'], unique: true },
      ]) {
        await queryInterface.addIndex('markets', {
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
