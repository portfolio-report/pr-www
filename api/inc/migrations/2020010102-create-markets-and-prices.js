module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.createTable(
        'markets',
        {
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
        },
        {
          transaction,
        }
      )

      for (const indexOptions of [
        { fields: ['securityId'] },
        { fields: ['securityId', 'marketCode'], unique: true },
      ]) {
        await queryInterface.addIndex('markets', {
          transaction,
          ...indexOptions,
        })
      }

      await queryInterface.createTable(
        'prices',
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

  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable('markets')
    await queryInterface.dropTable('prices')
  },
}
