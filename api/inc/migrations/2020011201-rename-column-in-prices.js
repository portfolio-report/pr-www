module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      // Rename column 'value' to 'close'
      await queryInterface.createTable(
        'prices_new',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          marketId: {
            type: Sequelize.INTEGER,
            references: {
              model: 'markets',
              key: 'id',
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',
          },
          date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          close: {
            type: Sequelize.DECIMAL(10, 4),
            allowNull: false,
          },
        },
        {
          transaction,
        }
      )

      await queryInterface.sequelize.query(
        `INSERT INTO prices_new SELECT id, marketId, date, value as close FROM prices`,
        { transaction }
      )

      await queryInterface.dropTable('prices', { transaction })
      await queryInterface.renameTable('prices_new', 'prices', { transaction })

      // Restore indices
      for (const indexOptions of [
        { fields: ['marketId'] },
        { fields: ['marketId', 'date'], unique: true },
      ]) {
        await queryInterface.addIndex('prices', {
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
    const transaction = await queryInterface.sequelize.transaction()
    try {
      // Rename column 'close' to 'value'
      await queryInterface.createTable(
        'prices_new',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          marketId: {
            type: Sequelize.INTEGER,
            references: {
              model: 'markets',
              key: 'id',
            },
            onUpdate: 'cascade',
            onDelete: 'cascade',
          },
          date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          value: {
            type: Sequelize.DECIMAL(10, 4),
            allowNull: false,
          },
        },
        {
          transaction,
        }
      )

      await queryInterface.sequelize.query(
        `INSERT INTO prices_new SELECT id, marketId, date, close as value FROM prices`,
        { transaction }
      )

      await queryInterface.dropTable('prices', { transaction })
      await queryInterface.renameTable('prices_new', 'prices', { transaction })

      // Restore indices
      for (const indexOptions of [
        { fields: ['marketId'] },
        { fields: ['marketId', 'date'], unique: true },
      ]) {
        await queryInterface.addIndex('prices', {
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
}
